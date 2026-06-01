from __future__ import annotations

import json
from typing import Any

from langgraph.types import interrupt

from orchestrator.core.config import settings
from orchestrator.core.database import SupabaseRunStore, get_supabase
from orchestrator.graph.state import OrchestratorState
from orchestrator.services.deep_research import run_deep_research
from orchestrator.services.llm import analyzer_llm, planner_llm, writer_llm
from orchestrator.services.retriever import SupabaseRetriever

STEP_ORDER = {
    "deep_research": 1,
    "human_review": 2,
    "publish": 3,
    "planner": 1,
    "retriever": 2,
    "analyzer": 3,
    "writer": 4,
}


def _store() -> SupabaseRunStore:
    return SupabaseRunStore(get_supabase())


def deep_research_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    run_config = state.get("run_config") or {}
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "deep_research",
        STEP_ORDER["deep_research"],
        "Plan, retrieve, critique, and draft with Deep Agents",
        {"question": state["question"], "run_config": run_config},
    )
    result = run_deep_research(state)
    chunks = result.get("retrieved_chunks", [])
    meta = result.get("deep_research_meta", {})
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "deep_research",
        started,
        {
            "depth": meta.get("depth"),
            "evidence_count": len(chunks),
            "confidence": meta.get("confidence"),
            "open_question_count": len(meta.get("open_questions") or []),
        },
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "trace",
        "Deep research plan",
        {
            "research_plan": result.get("research_plan", []),
            "critique_notes": result.get("critique_notes", ""),
            "meta": meta,
        },
    )
    chunks_without_content = [
        {k: v for k, v in c.items() if k not in ("content", "citation_label")}
        for c in chunks
    ]
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "retrieval_set",
        "Retrieved evidence",
        {"chunks": chunks_without_content},
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "draft_report",
        "Draft report",
        {
            "content_markdown": result.get("draft_report", ""),
            "summary": str(result.get("analysis_notes", ""))[:2000],
        },
    )
    return result


def planner_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "planner",
        STEP_ORDER["planner"],
        "Create focused research plan",
        {"question": state["question"]},
    )
    result = planner_llm(state["owner_user_id"]).invoke_json(
        "Return strict JSON with key research_plan: array of 3-6 concise retrieval queries.",
        f"Case question:\n{state['question']}",
    )
    def _extract_str(item: Any) -> str:
        if isinstance(item, dict):
            return str(next((v for v in item.values() if isinstance(v, str)), item))
        return str(item)
    
    plan = [_extract_str(item) for item in result.get("research_plan", []) if _extract_str(item).strip()]
    if not plan:
        plan = [state["question"]]
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "planner",
        started,
        {"research_plan": plan},
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "trace",
        "Research plan",
        {"research_plan": plan},
    )
    return {"research_plan": plan}


def retriever_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    plan = state.get("research_plan") or [state["question"]]
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "retriever",
        STEP_ORDER["retriever"],
        "Retrieve owner-scoped evidence chunks",
        {"queries": plan, "case_id": state["case_id"]},
    )
    records = SupabaseRetriever(get_supabase()).retrieve(
        plan, state["case_id"], state["owner_user_id"]
    )
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "retriever",
        started,
        {"chunk_count": len(records)},
    )
    chunks_without_content = [
        {k: v for k, v in c.items() if k not in ("content", "citation_label")}
        for c in records
    ]
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "retrieval_set",
        "Retrieved evidence",
        {"chunks": chunks_without_content},
    )
    return {"retrieved_chunks": records}


def analyzer_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    chunks = state.get("retrieved_chunks", [])
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "analyzer",
        STEP_ORDER["analyzer"],
        "Synthesize findings from retrieved evidence",
        {"chunk_count": len(chunks)},
    )
    evidence = json.dumps(chunks, ensure_ascii=True)[:24000]
    notes = analyzer_llm(state["owner_user_id"]).invoke_text(
        "Use only supplied evidence. Produce concise structured notes with uncertainties.",
        f"Question:\n{state['question']}\n\nEvidence JSON:\n{evidence}",
    )
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "analyzer",
        started,
        {"analysis_notes": notes},
    )
    return {"analysis_notes": notes}


def writer_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    chunks = state.get("retrieved_chunks", [])
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "writer",
        STEP_ORDER["writer"],
        "Write draft report with citations",
        {"chunk_count": len(chunks)},
    )
    evidence = json.dumps(chunks, ensure_ascii=True)[:24000]
    result = writer_llm(state["owner_user_id"]).invoke_json(
        (
            "Return strict JSON with keys draft_report, summary, citation_map. "
            "draft_report must be markdown. Inline citations must use labels already "
            "present in evidence citation_label values."
        ),
        (
            f"Question:\n{state['question']}\n\n"
            f"Analysis notes:\n{state.get('analysis_notes', '')}\n\n"
            f"Evidence JSON:\n{evidence}"
        ),
    )
    draft = str(result.get("draft_report") or "")
    citation_map = result.get("citation_map") or {
        item.get("citation_label", ""): item.get("chunk_id", "") for item in chunks
    }
    summary = str(result.get("summary") or "")[:2000]
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "writer",
        started,
        {"summary": summary, "citation_count": len(citation_map)},
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "draft_report",
        "Draft report",
        {"content_markdown": draft, "summary": summary},
    )
    return {"draft_report": draft, "citation_map": citation_map}


def human_review_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    run_config = state.get("run_config") or {}
    run = store.get_run_for_owner(state["run_id"], state["owner_user_id"])
    if run.get("status") == "resuming":
        report = store.latest_report_version(
            state["case_id"], state["run_id"], state["owner_user_id"], "draft"
        )
        review_payload = interrupt(
            {
                "run_id": state["run_id"],
                "report_version_id": (report or {}).get("id"),
                "status": "resuming",
            }
        )
        final_report = (report or {}).get("content_markdown") or state.get(
            "draft_report", ""
        )
        review_status = "approved"
        if isinstance(review_payload, dict):
            review_status = str(review_payload.get("review_status") or "approved")
            final_report = str(review_payload.get("final_report") or final_report)
        return {
            "review_status": review_status,
            "final_report": final_report,
            "report_version_id": str((report or {}).get("id") or ""),
        }

    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "human_review",
        STEP_ORDER["human_review"],
        "Persist draft and pause for human approval",
        {"has_draft": bool(state.get("draft_report"))},
    )
    report = store.upsert_draft_report(
        state["case_id"],
        state["run_id"],
        state["owner_user_id"],
        settings.REPORT_TITLE_PREFIX,
        state.get("analysis_notes", "")[:2000],
        state.get("draft_report", ""),
    )
    if run_config.get("human_review_enabled") is False:
        store.finish_step(
            state["run_id"],
            state["owner_user_id"],
            "human_review",
            started,
            {"report_version_id": report.get("id"), "skipped": True},
        )
        return {
            "review_status": "skipped",
            "final_report": state.get("draft_report", ""),
            "report_version_id": str(report.get("id") or ""),
        }
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "human_review",
        started,
        {"report_version_id": report.get("id")},
        status="paused",
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "human_review",
        "Draft ready for review",
        {"report_version_id": report.get("id")},
    )
    store.update_run(
        state["run_id"],
        state["owner_user_id"],
        {
            "status": "needs_review",
            "needs_review": True,
            "review_summary": "Draft report ready for review",
            "checkpoint_ref": state["run_id"],
            "checkpoint_at": report.get("updated_at"),
        },
    )
    review_payload = interrupt(
        {
            "run_id": state["run_id"],
            "report_version_id": report.get("id"),
            "status": "needs_review",
        }
    )
    final_report = ""
    review_status = "approved"
    if isinstance(review_payload, dict):
        review_status = str(review_payload.get("review_status") or "approved")
        final_report = str(review_payload.get("final_report") or "")
    return {
        "review_status": review_status,
        "final_report": final_report or state.get("draft_report", ""),
        "report_version_id": str(report.get("id") or ""),
    }


def publish_node(state: OrchestratorState) -> dict[str, Any]:
    store = _store()
    draft = store.latest_report_version(
        state["case_id"], state["run_id"], state["owner_user_id"], "draft"
    )
    final_markdown = (
        state.get("final_report") or (draft or {}).get("content_markdown") or ""
    )
    started = store.start_step(
        state["run_id"],
        state["owner_user_id"],
        "publish",
        STEP_ORDER["publish"],
        "Publish reviewed report",
        {"report_version_id": (draft or {}).get("id")},
    )
    published = store.publish_latest_draft(
        state["case_id"], state["run_id"], state["owner_user_id"], final_markdown
    )
    store.finish_step(
        state["run_id"],
        state["owner_user_id"],
        "publish",
        started,
        {"report_version_id": published.get("id")},
    )
    store.write_artifact(
        state["run_id"],
        state["case_id"],
        state["owner_user_id"],
        "trace",
        "Published report",
        {"report_version_id": published.get("id")},
    )
    return {
        "final_report": final_markdown,
        "report_version_id": str(published.get("id") or ""),
    }
