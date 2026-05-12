from __future__ import annotations

import os
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.core.config import settings
from app.core.database import get_supabase, response_rows
from app.tasks.ingestion import _process_source


pytestmark = pytest.mark.skipif(
    not os.getenv("RUN_WORKER_LIVE_TESTS"),
    reason="Set RUN_WORKER_LIVE_TESTS=1 with Supabase env to run live worker tests.",
)

SEED_OWNER_ID = "11111111-1111-1111-1111-111111111111"
SEED_CASE_ID = "22222222-2222-2222-2222-222222222222"


def test_live_match_chunks_rpc_exists() -> None:
    client = get_supabase()
    rows = response_rows(
        client.rpc(
            "match_chunks",
            {
                "query_embedding": [0.0] * settings.GEMINI_EMBEDDING_DIMENSIONS,
                "match_threshold": -1.0,
                "match_count": 1,
                "filter_case_id": "00000000-0000-0000-0000-000000000000",
                "filter_owner_id": "00000000-0000-0000-0000-000000000000",
            },
        ).execute()
    )
    assert rows == []


@pytest.mark.skipif(
    os.getenv("RUN_WORKER_LIVE_INGESTION_TESTS") != "1",
    reason="Set RUN_WORKER_LIVE_INGESTION_TESTS=1 to run real ingestion.",
)
def test_live_note_ingestion_pipeline() -> None:
    client = get_supabase()
    source_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    note_text = (
        "Worker live ingestion smoke test. "
        "This temporary source validates document creation, chunk indexing, "
        "Gemini embeddings, and owner-scoped Supabase writes."
    )

    client.table("sources").insert(
        {
            "id": source_id,
            "case_id": SEED_CASE_ID,
            "owner_user_id": SEED_OWNER_ID,
            "source_type": "note",
            "title": "Worker live ingestion smoke test",
            "note_text": note_text,
            "status": "pending",
            "created_at": now,
            "updated_at": now,
        }
    ).execute()

    try:
        result = _process_source(source_id)
        assert result["status"] == "indexed"
        assert result["chunk_count"] >= 1

        sources = response_rows(
            client.table("sources")
            .select("status,error_message")
            .eq("id", source_id)
            .eq("owner_user_id", SEED_OWNER_ID)
            .execute()
        )
        assert sources[0]["status"] == "indexed"
        assert not sources[0].get("error_message")

        documents = response_rows(
            client.table("documents")
            .select("id")
            .eq("source_id", source_id)
            .eq("owner_user_id", SEED_OWNER_ID)
            .execute()
        )
        assert len(documents) == 1

        chunks = response_rows(
            client.table("chunks")
            .select("id,metadata_json")
            .eq("document_id", documents[0]["id"])
            .eq("owner_user_id", SEED_OWNER_ID)
            .execute()
        )
        assert len(chunks) == result["chunk_count"]
        assert chunks[0]["metadata_json"]["source_id"] == source_id
    finally:
        documents = response_rows(
            client.table("documents")
            .select("id")
            .eq("source_id", source_id)
            .eq("owner_user_id", SEED_OWNER_ID)
            .execute()
        )
        doc_ids = [row["id"] for row in documents]
        if doc_ids:
            client.table("chunks").delete().in_("document_id", doc_ids).eq(
                "owner_user_id", SEED_OWNER_ID
            ).execute()
            client.table("documents").delete().eq("source_id", source_id).eq(
                "owner_user_id", SEED_OWNER_ID
            ).execute()
        client.table("ingestion_attempts").delete().eq("source_id", source_id).eq(
            "owner_user_id", SEED_OWNER_ID
        ).execute()
        client.table("sources").delete().eq("id", source_id).eq(
            "owner_user_id", SEED_OWNER_ID
        ).execute()
