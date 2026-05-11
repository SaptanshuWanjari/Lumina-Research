from __future__ import annotations

from pathlib import Path

from langgraph.checkpoint.memory import InMemorySaver

from orchestrator.core.celery_app import celery_app
import orchestrator.tasks.runs  # noqa: F401
from orchestrator.graph.build import build_graph


def test_celery_registers_run_tasks() -> None:
    assert "orchestrator.tasks.runs.start_run" in celery_app.tasks
    assert "orchestrator.tasks.runs.resume_run" in celery_app.tasks


def test_langgraph_compiles_with_checkpointer() -> None:
    graph = build_graph(InMemorySaver())

    assert graph is not None


def test_retriever_contract_enforces_case_and_owner_filters() -> None:
    source = Path("orchestrator/services/retriever.py").read_text()

    assert '"filter_case_id": case_id' in source
    assert '"filter_owner_id": owner_user_id' in source
    assert '"match_chunks"' in source
