from __future__ import annotations

from typing import Any

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

from orchestrator.graph import nodes
from orchestrator.graph.build import build_graph


class DryRunStore:
    def __init__(self) -> None:
        self.run = {
            "id": "run-dry",
            "status": "queued",
            "needs_review": False,
        }
        self.steps: list[dict[str, Any]] = []
        self.artifacts: list[dict[str, Any]] = []
        self.report: dict[str, Any] | None = None

    def get_run_for_owner(self, run_id: str, owner_user_id: str) -> dict[str, Any]:
        return self.run

    def update_run(
        self, run_id: str, owner_user_id: str, values: dict[str, Any]
    ) -> dict[str, Any]:
        self.run.update(values)
        return self.run

    def start_step(
        self,
        run_id: str,
        owner_user_id: str,
        step_key: str,
        step_order: int,
        goal: str,
        input_json: dict[str, Any] | None = None,
    ) -> float:
        self.steps.append(
            {
                "step_key": step_key,
                "step_order": step_order,
                "status": "running",
                "goal": goal,
                "input_json": input_json or {},
            }
        )
        self.run.update({"status": "running", "current_step": step_key})
        return float(len(self.steps))

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
        for step in reversed(self.steps):
            if step["step_key"] == step_key:
                step.update(
                    {
                        "status": status,
                        "output_json": output_json or {},
                        "error_message": error_message,
                    }
                )
                return

    def write_artifact(
        self,
        run_id: str,
        case_id: str,
        owner_user_id: str,
        artifact_type: str,
        title: str,
        payload_json: dict[str, Any],
    ) -> dict[str, Any]:
        artifact = {
            "run_id": run_id,
            "case_id": case_id,
            "owner_user_id": owner_user_id,
            "artifact_type": artifact_type,
            "title": title,
            "payload_json": payload_json,
        }
        self.artifacts.append(artifact)
        return artifact

    def upsert_draft_report(
        self,
        case_id: str,
        run_id: str,
        owner_user_id: str,
        title: str,
        summary: str,
        content_markdown: str,
        citations_json: dict[str, Any],
    ) -> dict[str, Any]:
        self.report = {
            "id": "report-dry",
            "case_id": case_id,
            "run_id": run_id,
            "owner_user_id": owner_user_id,
            "status": "draft",
            "title": title,
            "summary": summary,
            "content_markdown": content_markdown,
            "citations_json": citations_json,
            "updated_at": "2026-05-11T00:00:00+00:00",
        }
        return self.report

    def latest_report_version(
        self, case_id: str, run_id: str, owner_user_id: str, status: str | None = None
    ) -> dict[str, Any] | None:
        if status and self.report and self.report["status"] != status:
            return None
        return self.report

    def publish_latest_draft(
        self, case_id: str, run_id: str, owner_user_id: str, final_markdown: str
    ) -> dict[str, Any]:
        assert self.report is not None
        self.report.update(
            {
                "status": "published",
                "content_markdown": final_markdown,
                "published_at": "2026-05-11T00:01:00+00:00",
            }
        )
        return self.report


class DryRunPlanner:
    def invoke_json(self, system: str, user: str) -> dict[str, Any]:
        return {"research_plan": ["regional demand", "logistics risk"]}


class DryRunAnalyzer:
    def invoke_text(self, system: str, user: str) -> str:
        return "Demand is rising; logistics SLA is the gating risk."


class DryRunWriter:
    def invoke_json(self, system: str, user: str) -> dict[str, Any]:
        return {
            "draft_report": "## Draft\n\nDemand is rising [1]. Logistics SLA matters [1].",
            "summary": "Demand up; logistics is key.",
            "citation_map": {"[1]": "chunk-dry"},
        }


class DryRunRetriever:
    def __init__(self, client: object) -> None:
        self.client = client

    def retrieve(
        self, queries: list[str], case_id: str, owner_user_id: str
    ) -> list[dict[str, Any]]:
        assert queries == ["regional demand", "logistics risk"]
        assert case_id == "case-dry"
        assert owner_user_id == "owner-dry"
        return [
            {
                "chunk_id": "chunk-dry",
                "document_id": "doc-dry",
                "source_id": "source-dry",
                "case_id": case_id,
                "owner_user_id": owner_user_id,
                "content": "Regional demand grows 12% YoY when logistics SLAs are met.",
                "score": 0.91,
                "metadata": {"section": "summary"},
                "query": queries[0],
                "citation_label": "[1]",
            }
        ]


def test_langgraph_dry_run_interrupts_and_resumes_to_publish(monkeypatch) -> None:
    store = DryRunStore()
    monkeypatch.setattr(nodes, "_store", lambda: store)
    monkeypatch.setattr(nodes, "planner_llm", lambda: DryRunPlanner())
    monkeypatch.setattr(nodes, "analyzer_llm", lambda: DryRunAnalyzer())
    monkeypatch.setattr(nodes, "writer_llm", lambda: DryRunWriter())
    monkeypatch.setattr(nodes, "SupabaseRetriever", DryRunRetriever)
    monkeypatch.setattr(nodes, "get_supabase", lambda: object())

    graph = build_graph(InMemorySaver())
    config = {"configurable": {"thread_id": "run-dry"}}
    state = {
        "run_id": "run-dry",
        "case_id": "case-dry",
        "owner_user_id": "owner-dry",
        "question": "Should we open three new stores in 2026?",
    }

    interrupted = graph.invoke(state, config=config)

    assert "__interrupt__" in interrupted
    assert store.run["status"] == "needs_review"
    assert store.run["needs_review"] is True
    assert store.report is not None
    assert store.report["status"] == "draft"
    assert [step["step_key"] for step in store.steps[:5]] == [
        "planner",
        "retriever",
        "analyzer",
        "writer",
        "human_review",
    ]

    store.update_run("run-dry", "owner-dry", {"status": "resuming", "needs_review": False})
    completed = graph.invoke(
        Command(
            resume={
                "review_status": "approved",
                "final_report": "## Final\n\nHuman-edited approved report [1].",
                "report_version_id": "report-dry",
            }
        ),
        config=config,
    )

    assert completed["review_status"] == "approved"
    assert completed["final_report"].startswith("## Final")
    assert completed["report_version_id"] == "report-dry"
    assert store.report["status"] == "published"
    assert store.report["content_markdown"].startswith("## Final")
    assert store.steps[-1]["step_key"] == "publish"
    assert store.steps[-1]["status"] == "success"
