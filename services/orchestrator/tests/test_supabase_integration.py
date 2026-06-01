from __future__ import annotations

import pytest

from tests.conftest import SEED_CASE_ID, SEED_OWNER_ID, assert_seeded_case_exists


def test_seeded_case_read_requires_owner_filter(supabase_client, run_store) -> None:
    assert_seeded_case_exists(supabase_client)

    case = run_store.get_case(SEED_CASE_ID, SEED_OWNER_ID)
    assert case["id"] == SEED_CASE_ID
    assert case["owner_user_id"] == SEED_OWNER_ID

    with pytest.raises(RuntimeError, match="Case not found"):
        run_store.get_case(SEED_CASE_ID, "00000000-0000-0000-0000-000000000000")


def test_run_store_writes_status_steps_artifacts_and_report_versions(
    supabase_client, run_store, integration_run
) -> None:
    assert_seeded_case_exists(supabase_client)

    updated = run_store.update_run(
        integration_run,
        SEED_OWNER_ID,
        {
            "status": "running",
            "current_step": "planner",
            "checkpoint_ref": integration_run,
        },
    )
    assert updated["status"] == "running"
    assert updated["current_step"] == "planner"

    started = run_store.start_step(
        integration_run,
        SEED_OWNER_ID,
        "planner",
        1,
        "Validate step persistence",
        {"question": "Should we expand?"},
    )
    run_store.finish_step(
        integration_run,
        SEED_OWNER_ID,
        "planner",
        started,
        {"research_plan": ["demand", "logistics"]},
    )
    steps = (
        supabase_client.table("run_steps")
        .select("*")
        .eq("run_id", integration_run)
        .eq("owner_user_id", SEED_OWNER_ID)
        .execute()
        .data
    )
    assert len(steps) == 1
    assert steps[0]["status"] == "success"

    artifact = run_store.write_artifact(
        integration_run,
        SEED_CASE_ID,
        SEED_OWNER_ID,
        "trace",
        "Validation artifact",
        {"ok": True},
    )
    assert artifact["run_id"] == integration_run
    assert artifact["case_id"] == SEED_CASE_ID
    assert artifact["owner_user_id"] == SEED_OWNER_ID

    draft = run_store.upsert_draft_report(
        SEED_CASE_ID,
        integration_run,
        SEED_OWNER_ID,
        "Validation Draft",
        "Draft summary",
        "## Draft\n\nEvidence-backed draft.",
    )
    assert draft["status"] == "draft"
    assert draft["run_id"] == integration_run

    published = run_store.publish_latest_draft(
        SEED_CASE_ID,
        integration_run,
        SEED_OWNER_ID,
        "## Final\n\nReviewed report.",
    )
    assert published["status"] == "published"
    assert published["content_markdown"].startswith("## Final")
