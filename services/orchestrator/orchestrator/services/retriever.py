from __future__ import annotations

from typing import Any

from supabase import Client

from orchestrator.core.config import settings
from orchestrator.core.database import response_rows
from orchestrator.graph.state import EvidenceRecord


class SupabaseRetriever:
    def __init__(self, client: Client):
        self.client = client
        self._embedder: Any | None = None

    def _embedding_client(self) -> Any:
        if self._embedder is None:
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
            except ImportError as exc:
                raise RuntimeError(
                    "langchain-google-genai is required for Gemini embeddings"
                ) from exc
            if not settings.GOOGLE_API_KEY:
                raise RuntimeError("GOOGLE_API_KEY is required for retrieval embeddings")
            kwargs = {
                "model": settings.GEMINI_EMBEDDING_MODEL,
                "api_key": settings.GOOGLE_API_KEY,
            }
            try:
                self._embedder = GoogleGenerativeAIEmbeddings(
                    **kwargs,
                    output_dimensionality=settings.GEMINI_EMBEDDING_DIMENSIONS,
                )
            except TypeError:
                self._embedder = GoogleGenerativeAIEmbeddings(**kwargs)
        return self._embedder

    def retrieve(
        self, queries: list[str], case_id: str, owner_user_id: str
    ) -> list[EvidenceRecord]:
        records: list[EvidenceRecord] = []
        seen: set[str] = set()
        embedder = self._embedding_client()

        for query in queries:
            embedding = embedder.embed_query(query)
            if len(embedding) != settings.GEMINI_EMBEDDING_DIMENSIONS:
                raise RuntimeError(
                    "Retrieval embedding dimension mismatch: "
                    f"got {len(embedding)}, expected {settings.GEMINI_EMBEDDING_DIMENSIONS}"
                )
            rows = response_rows(
                self.client.rpc(
                    "match_chunks",
                    {
                        "query_embedding": embedding,
                        "match_threshold": settings.RETRIEVAL_MATCH_THRESHOLD,
                        "match_count": settings.RETRIEVAL_MATCH_COUNT,
                        "filter_case_id": case_id,
                        "filter_owner_id": owner_user_id,
                    },
                ).execute()
            )
            for row in rows:
                chunk_id = str(row.get("id") or row.get("chunk_id") or "")
                if not chunk_id or chunk_id in seen:
                    continue
                seen.add(chunk_id)
                metadata = row.get("metadata_json") or row.get("metadata") or {}
                records.append(
                    {
                        "chunk_id": chunk_id,
                        "document_id": str(row.get("document_id") or ""),
                        "source_id": str(
                            row.get("source_id") or metadata.get("source_id") or ""
                        ),
                        "case_id": str(row.get("case_id") or case_id),
                        "owner_user_id": str(row.get("owner_user_id") or owner_user_id),
                        "content": str(row.get("content") or ""),
                        "score": float(row.get("similarity") or row.get("score") or 0),
                        "metadata": metadata,
                        "query": query,
                        "citation_label": f"[{len(records) + 1}]",
                    }
                )
        return records
