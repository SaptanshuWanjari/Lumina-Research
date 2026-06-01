from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from time import perf_counter
from typing import Any

from supabase import Client, create_client

from orchestrator.core.config import settings


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def response_rows(response: Any) -> list[dict[str, Any]]:
    data = getattr(response, "data", None)
    return data if isinstance(data, list) else []


def response_one(response: Any) -> dict[str, Any] | None:
    rows = response_rows(response)
    return rows[0] if rows else None


def bootstrap_run(client: Client, run_id: str) -> dict[str, Any]:
    row = response_one(client.table("runs").select("*").eq("id", run_id).execute())
    if not row:
        raise RuntimeError("Run not found")
    return row


class SupabaseRunStore:
    def __init__(self, client: Client | None = None):
        self.client = client or get_supabase()

    def get_case(self, case_id: str, owner_user_id: str) -> dict[str, Any]:
        row = response_one(
            self.client.table("cases")
            .select("*")
            .eq("id", case_id)
            .eq("owner_user_id", owner_user_id)
            .execute()
        )
        if not row:
            raise RuntimeError("Case not found or access denied")
        return row

    def get_run_for_owner(self, run_id: str, owner_user_id: str) -> dict[str, Any]:
        row = response_one(
            self.client.table("runs")
            .select("*")
            .eq("id", run_id)
            .eq("owner_user_id", owner_user_id)
            .execute()
        )
        if not row:
            raise RuntimeError("Run not found or access denied")
        return row

    def get_ai_settings(self, owner_user_id: str) -> dict[str, Any] | None:
        return response_one(
            self.client.table("ai_settings")
            .select("*")
            .eq("owner_user_id", owner_user_id)
            .execute()
        )

    def update_run(
        self, run_id: str, owner_user_id: str, values: dict[str, Any]
    ) -> dict[str, Any]:
        payload = {**values, "updated_at": utcnow_iso()}
        row = response_one(
            self.client.table("runs")
            .update(payload)
            .eq("id", run_id)
            .eq("owner_user_id", owner_user_id)
            .execute()
        )
        if not row:
            raise RuntimeError("Run update failed")
        return row

    def start_step(
        self,
        run_id: str,
        owner_user_id: str,
        step_key: str,
        step_order: int,
        goal: str,
        input_json: dict[str, Any] | None = None,
    ) -> float:
        now = utcnow_iso()
        payload = {
            "run_id": run_id,
            "owner_user_id": owner_user_id,
            "step_key": step_key,
            "step_order": step_order,
            "status": "running",
            "goal": goal,
            "input_json": input_json or {},
            "error_message": None,
            "started_at": now,
            "completed_at": None,
            "duration_ms": None,
            "updated_at": now,
        }
        updated = response_rows(
            self.client.table("run_steps")
            .update(payload)
            .eq("run_id", run_id)
            .eq("owner_user_id", owner_user_id)
            .eq("step_key", step_key)
            .execute()
        )
        if not updated:
            self.client.table("run_steps").insert(payload).execute()
        self.update_run(
            run_id,
            owner_user_id,
            {
                "status": "running",
                "current_step": step_key,
                "checkpoint_ref": run_id,
                "checkpoint_at": now,
            },
        )
        return perf_counter()

    def finish_step(
        self,
        run_id: str,
        owner_user_id: str,
        step_key: str,
        started: float,
        output_json: dict[str, Any] | None = None,
        status: str = "success",
        error_message: str | None = None,
    ) -> None:
        now = utcnow_iso()
        self.client.table("run_steps").update(
            {
                "status": status,
                "output_json": output_json or {},
                "error_message": error_message,
                "completed_at": now,
                "duration_ms": int((perf_counter() - started) * 1000),
                "updated_at": now,
            }
        ).eq("run_id", run_id).eq("owner_user_id", owner_user_id).eq(
            "step_key", step_key
        ).execute()
        self.update_run(
            run_id,
            owner_user_id,
            {"current_step": step_key, "checkpoint_ref": run_id, "checkpoint_at": now},
        )

    def fail_step(
        self,
        run_id: str,
        owner_user_id: str,
        step_key: str,
        error_message: str,
    ) -> None:
        now = utcnow_iso()
        self.client.table("run_steps").update(
            {
                "status": "failed",
                "error_message": error_message,
                "completed_at": now,
                "updated_at": now,
            }
        ).eq("run_id", run_id).eq("owner_user_id", owner_user_id).eq(
            "step_key", step_key
        ).execute()

    def write_artifact(
        self,
        run_id: str,
        case_id: str,
        owner_user_id: str,
        artifact_type: str,
        title: str,
        payload_json: dict[str, Any],
    ) -> dict[str, Any]:
        return response_one(
            self.client.table("run_artifacts")
            .insert(
                {
                    "run_id": run_id,
                    "case_id": case_id,
                    "owner_user_id": owner_user_id,
                    "artifact_type": artifact_type,
                    "title": title,
                    "payload_json": payload_json,
                }
            )
            .execute()
        ) or {}

    def latest_report_version(
        self, case_id: str, run_id: str, owner_user_id: str, status: str | None = None
    ) -> dict[str, Any] | None:
        query = (
            self.client.table("report_versions")
            .select("*")
            .eq("case_id", case_id)
            .eq("run_id", run_id)
            .eq("owner_user_id", owner_user_id)
        )
        if status:
            query = query.eq("status", status)
        return response_one(
            query.order("version_number", desc=True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

    def next_report_version_number(self, case_id: str, owner_user_id: str) -> int:
        row = response_one(
            self.client.table("report_versions")
            .select("version_number")
            .eq("case_id", case_id)
            .eq("owner_user_id", owner_user_id)
            .order("version_number", desc=True)
            .limit(1)
            .execute()
        )
        return int(row["version_number"]) + 1 if row else 1

    def upsert_draft_report(
        self,
        case_id: str,
        run_id: str,
        owner_user_id: str,
        title: str,
        summary: str,
        content_markdown: str,
    ) -> dict[str, Any]:
        now = utcnow_iso()
        existing = self.latest_report_version(case_id, run_id, owner_user_id, "draft")
        payload = {
            "title": title,
            "summary": summary,
            "content_markdown": content_markdown,
            "updated_at": now,
        }
        if existing:
            return response_one(
                self.client.table("report_versions")
                .update(payload)
                .eq("id", existing["id"])
                .eq("owner_user_id", owner_user_id)
                .eq("case_id", case_id)
                .execute()
            ) or existing

        payload.update(
            {
                "case_id": case_id,
                "run_id": run_id,
                "owner_user_id": owner_user_id,
                "version_number": self.next_report_version_number(case_id, owner_user_id),
                "status": "draft",
                "created_by_user_id": owner_user_id,
            }
        )
        return response_one(
            self.client.table("report_versions").insert(payload).execute()
        ) or {}

    def publish_latest_draft(
        self, case_id: str, run_id: str, owner_user_id: str, final_markdown: str
    ) -> dict[str, Any]:
        draft = self.latest_report_version(case_id, run_id, owner_user_id, "draft")
        if not draft:
            raise RuntimeError("No draft report_version found for publish")
        now = utcnow_iso()
        self._archive_published_report_versions(case_id, draft["id"], now)
        try:
            return self._publish_report_version(draft, case_id, owner_user_id, final_markdown, now)
        except Exception as exc:
            if "uq_report_versions_one_published_per_case" not in str(exc) and "23505" not in str(exc):
                raise
            now = utcnow_iso()
            self._archive_published_report_versions(case_id, draft["id"], now)
            return self._publish_report_version(draft, case_id, owner_user_id, final_markdown, now)

    def _archive_published_report_versions(
        self, case_id: str, excluded_report_version_id: str, now: str
    ) -> None:
        self.client.table("report_versions").update(
            {
                "status": "archived",
                "archived_at": now,
                "updated_at": now,
            }
        ).eq("case_id", case_id).eq("status", "published").neq(
            "id", excluded_report_version_id
        ).execute()

    def _publish_report_version(
        self,
        draft: dict[str, Any],
        case_id: str,
        owner_user_id: str,
        final_markdown: str,
        now: str,
    ) -> dict[str, Any]:
        return response_one(
            self.client.table("report_versions")
            .update(
                {
                    "status": "published",
                    "content_markdown": final_markdown,
                    "published_at": now,
                    "updated_at": now,
                }
            )
            .eq("id", draft["id"])
            .eq("case_id", case_id)
            .eq("owner_user_id", owner_user_id)
            .execute()
        ) or draft
