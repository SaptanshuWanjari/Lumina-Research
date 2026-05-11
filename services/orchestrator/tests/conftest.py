from __future__ import annotations

import os
from collections.abc import Iterator
from datetime import datetime, timezone
from uuid import uuid4

import httpx
import pytest

from orchestrator.core.database import SupabaseRunStore, get_supabase, response_rows


SEED_OWNER_ID = "11111111-1111-1111-1111-111111111111"
SEED_CASE_ID = "22222222-2222-2222-2222-222222222222"
SEED_RUN_ID = "88888888-8888-8888-8888-888888888888"


def _require_supabase_env() -> None:
    if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        pytest.skip("SUPABASE_SERVICE_ROLE_KEY is required for real Supabase tests")
    if os.getenv("ORCHESTRATOR_SUPABASE_INTEGRATION") != "1":
        pytest.skip("Set ORCHESTRATOR_SUPABASE_INTEGRATION=1 to run real Supabase tests")


@pytest.fixture(scope="session")
def supabase_client():
    _require_supabase_env()
    client = get_supabase()
    try:
        client.table("cases").select("id").limit(1).execute()
    except httpx.HTTPError as exc:
        pytest.skip(f"Supabase is not reachable: {exc}")
    return client


@pytest.fixture()
def run_store(supabase_client) -> SupabaseRunStore:
    return SupabaseRunStore(supabase_client)


@pytest.fixture()
def integration_run(supabase_client) -> Iterator[str]:
    run_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    supabase_client.table("runs").insert(
        {
            "id": run_id,
            "case_id": SEED_CASE_ID,
            "owner_user_id": SEED_OWNER_ID,
            "status": "queued",
            "needs_review": False,
            "triggered_by_user_id": SEED_OWNER_ID,
            "created_at": now,
            "updated_at": now,
            "started_at": now,
        }
    ).execute()

    yield run_id

    for table in ("report_versions", "run_artifacts", "run_steps"):
        supabase_client.table(table).delete().eq("run_id", run_id).eq(
            "owner_user_id", SEED_OWNER_ID
        ).execute()
    supabase_client.table("runs").delete().eq("id", run_id).eq(
        "owner_user_id", SEED_OWNER_ID
    ).execute()


def assert_seeded_case_exists(supabase_client) -> None:
    rows = response_rows(
        supabase_client.table("cases")
        .select("id")
        .eq("id", SEED_CASE_ID)
        .eq("owner_user_id", SEED_OWNER_ID)
        .execute()
    )
    if not rows:
        pytest.skip("Expected seeded case is missing from Supabase")
