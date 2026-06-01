from __future__ import annotations

import hashlib
from typing import Any

import httpx
from celery.utils.log import get_task_logger

from app.core.celery_app import celery_app
from app.core.config import configure_langsmith_env, settings
from app.core.database import (
    get_supabase,
    response_one,
    response_rows,
    update_owned,
    utcnow_iso,
)
from app.utils.embeddings import GeminiEmbedder, vector_literal
from app.utils.secrets import decrypt_secret
from app.utils.storage import download_source_file
from app.utils.text import (
    extract_file_text,
    fetch_url_text,
    normalize_text,
    split_text,
    token_count,
)

configure_langsmith_env()
from langsmith import traceable


logger = get_task_logger(__name__)


class IngestionStore:
    def __init__(self) -> None:
        self.client = get_supabase()

    def get_source(self, source_id: str) -> dict[str, Any]:
        row = response_one(
            self.client.table("sources").select("*").eq("id", source_id).execute()
        )
        if not row:
            raise RuntimeError("Source not found")
        return row

    def update_source(
        self, source_id: str, owner_user_id: str, values: dict[str, Any]
    ) -> dict[str, Any]:
        return update_owned(self.client, "sources", source_id, owner_user_id, values)

    def update_case_status(self, case_id: str, owner_user_id: str, status: str) -> None:
        update_owned(self.client, "cases", case_id, owner_user_id, {"status": status})

    def get_ai_settings(self, owner_user_id: str) -> dict[str, Any] | None:
        return response_one(
            self.client.table("ai_settings")
            .select("*")
            .eq("owner_user_id", owner_user_id)
            .execute()
        )

    def resolve_embeddings_key(self, owner_user_id: str) -> str:
        configured = self.get_ai_settings(owner_user_id) or {}
        provider = str(configured.get("provider") or "gemini").strip().lower()
        reuse_key = configured.get("reuse_api_key_for_embeddings")
        reuse = True if reuse_key is None else bool(reuse_key)

        if reuse:
            if provider != "gemini":
                raise RuntimeError(
                    "Embeddings key reuse is only supported with the Gemini provider"
                )
            encrypted = str(configured.get("encrypted_api_key") or "").strip()
            if not encrypted:
                raise RuntimeError("Embeddings require a stored Gemini API key")
            return decrypt_secret(encrypted)

        encrypted = str(configured.get("encrypted_embeddings_api_key") or "").strip()
        if not encrypted:
            raise RuntimeError("Embeddings require a stored API key")
        return decrypt_secret(encrypted)

    def start_attempt(self, source: dict[str, Any]) -> dict[str, Any]:
        rows = response_rows(
            self.client.table("ingestion_attempts")
            .select("attempt_no")
            .eq("source_id", source["id"])
            .eq("owner_user_id", source["owner_user_id"])
            .order("attempt_no", desc=True)
            .limit(1)
            .execute()
        )
        attempt_no = int(rows[0]["attempt_no"]) + 1 if rows else 1
        now = utcnow_iso()
        return response_one(
            self.client.table("ingestion_attempts")
            .insert(
                {
                    "source_id": source["id"],
                    "case_id": source["case_id"],
                    "owner_user_id": source["owner_user_id"],
                    "attempt_no": attempt_no,
                    "status": "running",
                    "stage": "fetch",
                    "started_at": now,
                    "updated_at": now,
                }
            )
            .execute()
        ) or {}

    def update_attempt(
        self,
        attempt_id: str | None,
        owner_user_id: str,
        values: dict[str, Any],
    ) -> None:
        if not attempt_id:
            return
        update_owned(
            self.client,
            "ingestion_attempts",
            attempt_id,
            owner_user_id,
            values,
        )

    def replace_document_and_chunks(
        self,
        source: dict[str, Any],
        text: str,
        parser: str,
        mime_type: str | None,
        chunks: list[str],
        embeddings: list[list[float]],
    ) -> tuple[str, int]:
        owner_user_id = source["owner_user_id"]
        old_docs = response_rows(
            self.client.table("documents")
            .select("id")
            .eq("source_id", source["id"])
            .eq("owner_user_id", owner_user_id)
            .execute()
        )
        old_doc_ids = [row["id"] for row in old_docs]
        if old_doc_ids:
            self.client.table("chunks").delete().in_("document_id", old_doc_ids).eq(
                "owner_user_id", owner_user_id
            ).execute()
            self.client.table("documents").delete().eq("source_id", source["id"]).eq(
                "owner_user_id", owner_user_id
            ).execute()

        now = utcnow_iso()
        document = response_one(
            self.client.table("documents")
            .insert(
                {
                    "source_id": source["id"],
                    "case_id": source["case_id"],
                    "owner_user_id": owner_user_id,
                    "version": 1,
                    "parser": parser,
                    "language": "und",
                    "mime_type": mime_type,
                    "content_text": text,
                    "char_count": len(text),
                    "token_count": token_count(text),
                    "metadata_json": {
                        "source_id": source["id"],
                        "source_type": source["source_type"],
                        "content_hash": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                    },
                    "updated_at": now,
                }
            )
            .execute()
        )
        if not document:
            raise RuntimeError("Document insert failed")

        chunk_rows = [
            {
                "document_id": document["id"],
                "case_id": source["case_id"],
                "owner_user_id": owner_user_id,
                "chunk_index": index,
                "content": chunk,
                "token_count": token_count(chunk),
                "embedding": vector_literal(embeddings[index]),
                "metadata_json": {
                    "source_id": source["id"],
                    "source_type": source["source_type"],
                    "parser": parser,
                },
            }
            for index, chunk in enumerate(chunks)
        ]
        if chunk_rows:
            self.client.table("chunks").insert(chunk_rows).execute()
        return str(document["id"]), len(chunk_rows)

    def refresh_case_status(self, case_id: str, owner_user_id: str) -> None:
        sources = response_rows(
            self.client.table("sources")
            .select("status")
            .eq("case_id", case_id)
            .eq("owner_user_id", owner_user_id)
            .execute()
        )
        active = [row for row in sources if row.get("status") != "archived"]
        if active and all(row.get("status") == "indexed" for row in active):
            self.update_case_status(case_id, owner_user_id, "indexed")
        elif any(row.get("status") == "indexed" for row in active):
            self.update_case_status(case_id, owner_user_id, "ingesting")
        elif active and all(row.get("status") == "failed" for row in active):
            self.update_case_status(case_id, owner_user_id, "failed")


@celery_app.task(
    name="worker.tasks.ingestion.process_source",
    bind=True,
    autoretry_for=(httpx.TimeoutException, httpx.TransportError),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def process_source(self, source_id: str) -> dict[str, Any]:
    return _process_source(source_id)


@traceable(name="worker.process_source", run_type="chain")
def _process_source(source_id: str) -> dict[str, Any]:
    store = IngestionStore()
    source = store.get_source(source_id)
    owner_user_id = source["owner_user_id"]
    attempt = store.start_attempt(source)
    attempt_id = attempt.get("id")

    try:
        store.update_case_status(source["case_id"], owner_user_id, "ingesting")
        store.update_source(
            source_id, owner_user_id, {"status": "fetching", "error_message": None}
        )
        store.update_attempt(attempt_id, owner_user_id, {"stage": "fetch"})

        text, parser, mime_type = _load_source_text(store, source)
        if not text:
            raise RuntimeError("No extractable text found")

        store.update_source(source_id, owner_user_id, {"status": "extracting"})
        store.update_attempt(attempt_id, owner_user_id, {"stage": "extract"})
        normalized = normalize_text(text)
        if not normalized:
            raise RuntimeError("No extractable text found after normalization")

        store.update_source(source_id, owner_user_id, {"status": "chunking"})
        store.update_attempt(attempt_id, owner_user_id, {"stage": "chunk"})
        chunks = split_text(
            normalized, settings.WORKER_CHUNK_SIZE, settings.WORKER_CHUNK_OVERLAP
        )
        if not chunks:
            raise RuntimeError("Document produced zero chunks")

        store.update_source(source_id, owner_user_id, {"status": "embedding"})
        store.update_attempt(attempt_id, owner_user_id, {"stage": "embed"})
        embeddings_key = store.resolve_embeddings_key(owner_user_id)
        embeddings = GeminiEmbedder(embeddings_key).embed_documents(chunks)

        store.update_attempt(attempt_id, owner_user_id, {"stage": "index"})
        document_id, chunk_count = store.replace_document_and_chunks(
            source, normalized, parser, mime_type, chunks, embeddings
        )
        finished_at = utcnow_iso()
        store.update_source(
            source_id,
            owner_user_id,
            {
                "status": "indexed",
                "error_message": None,
                "content_hash": hashlib.sha256(normalized.encode("utf-8")).hexdigest(),
            },
        )
        store.update_attempt(
            attempt_id,
            owner_user_id,
            {
                "status": "success",
                "finished_at": finished_at,
                "metrics_json": {
                    "char_count": len(normalized),
                    "token_count": token_count(normalized),
                    "chunk_count": chunk_count,
                    "document_id": document_id,
                },
            },
        )
        store.refresh_case_status(source["case_id"], owner_user_id)
        return {
            "source_id": source_id,
            "document_id": document_id,
            "chunk_count": chunk_count,
            "status": "indexed",
        }
    except Exception as exc:
        error_message = str(exc)[:2000]
        logger.exception("Ingestion failed for source %s", source_id)
        store.update_source(
            source_id,
            owner_user_id,
            {"status": "failed", "error_message": error_message},
        )
        store.update_attempt(
            attempt_id,
            owner_user_id,
            {
                "status": "failed",
                "error_message": error_message,
                "finished_at": utcnow_iso(),
            },
        )
        store.refresh_case_status(source["case_id"], owner_user_id)
        raise


def _load_source_text(
    store: IngestionStore, source: dict[str, Any]
) -> tuple[str, str, str | None]:
    source_type = source.get("source_type")
    
    if source_type in ("url", "n8n"):
        url = source.get("url")
        if url:
            import urllib.parse
            parsed_url = urllib.parse.urlparse(url)
            if parsed_url.hostname in ("localhost", "127.0.0.1"):
                new_netloc = parsed_url.netloc.replace(parsed_url.hostname, "host.docker.internal", 1)
                source["url"] = parsed_url._replace(netloc=new_netloc).geturl()

    if source_type == "note":
        return normalize_text(source.get("note_text") or ""), "note", "text/plain"
    if source_type == "url":
        url = source.get("url")
        if not url:
            raise RuntimeError("URL source missing url")
        return fetch_url_text(url)
    if source_type == "n8n":
        url = source.get("url")
        if not url:
            raise RuntimeError("n8n source missing webhook url")

        payload = {"case_id": source.get("case_id"), "source_id": source.get("id")}
        try:
            resp = httpx.post(url, json=payload, timeout=60.0)
            resp.raise_for_status()
            data = resp.json()
            text = data.get("text") or data.get("content") or data.get("markdown")
            if not text:
                raise RuntimeError("n8n webhook response missing text, content, or markdown field")
            return normalize_text(text), "n8n", "text/plain"
        except httpx.HTTPError as exc:
            raise RuntimeError(f"n8n webhook request failed: {exc}")
        except ValueError as exc:
            raise RuntimeError(f"n8n webhook response was not valid JSON: {exc}")
    if source_type == "file":
        storage_path = source.get("storage_path")
        if not storage_path:
            raise RuntimeError("File source missing storage_path")
        content = download_source_file(
            store.client, settings.SUPABASE_STORAGE_BUCKET, storage_path
        )
        metadata = source.get("metadata_json") or {}
        filename = metadata.get("filename") or storage_path
        return extract_file_text(content, str(filename), metadata.get("mime_type"))
    raise RuntimeError(f"Unsupported source_type: {source_type}")
