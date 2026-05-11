from __future__ import annotations

from typing import Any, NotRequired, TypedDict


class EvidenceRecord(TypedDict, total=False):
    chunk_id: str
    document_id: str
    source_id: str
    case_id: str
    owner_user_id: str
    content: str
    score: float
    metadata: dict[str, Any]
    query: str
    citation_label: str


class OrchestratorState(TypedDict):
    run_id: str
    case_id: str
    owner_user_id: str
    question: str
    research_plan: NotRequired[list[str]]
    retrieved_chunks: NotRequired[list[EvidenceRecord]]
    analysis_notes: NotRequired[str]
    draft_report: NotRequired[str]
    citation_map: NotRequired[dict[str, Any]]
    critique_notes: NotRequired[str]
    review_status: NotRequired[str]
    final_report: NotRequired[str]
    report_version_id: NotRequired[str]
