from __future__ import annotations

import ast
import json
import re
from typing import Any

from pydantic import BaseModel, Field, model_validator

from orchestrator.core.database import get_supabase
from orchestrator.graph.state import EvidenceRecord, OrchestratorState
from orchestrator.services.llm import chat_model, writer_llm
from orchestrator.services.retriever import SupabaseRetriever

class DeepResearchResponse(BaseModel):
    research_plan: list[str] = Field(default_factory=list)
    analysis_notes: str = ""
    critique_notes: str = ""
    draft_report: str = ""
    citation_map: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 0.0
    open_questions: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def preprocess_llm_json(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for field in ["draft_report", "analysis_notes", "critique_notes"]:
                val = data.get(field)
                if isinstance(val, dict):
                    md = []
                    for k, v in val.items():
                        title = str(k).replace("_", " ").title()
                        if isinstance(v, list):
                            v_str = "\n".join(f"- {x}" for x in v)
                        else:
                            v_str = str(v)
                        md.append(f"## {title}\n{v_str}")
                    data[field] = "\n\n".join(md)
                elif isinstance(val, list):
                    data[field] = "\n\n".join(str(x) for x in val)
            
            for list_field in ["research_plan", "open_questions"]:
                items = data.get(list_field)
                if isinstance(items, list):
                    clean = []
                    for item in items:
                        if isinstance(item, dict):
                            extracted = next((str(v) for v in item.values() if isinstance(v, str)), str(item))
                            clean.append(extracted)
                        else:
                            clean.append(str(item))
                    data[list_field] = clean
        return data


def _depth_config(run_config: dict[str, Any] | None) -> dict[str, Any]:
    config = run_config or {}
    depth = str(config.get("depth") or "standard").lower()
    if depth not in {"quick", "standard", "deep"}:
        depth = "standard"
    citation_strictness = str(config.get("citation_strictness") or "strict").lower()
    if citation_strictness not in {"lenient", "strict"}:
        citation_strictness = "strict"

    budgets = {
        "quick": {"tasks": "2-3", "max_results": 5, "followups": 0, "min_words": 500},
        "standard": {"tasks": "4-6", "max_results": 8, "followups": 1, "min_words": 1000},
        "deep": {"tasks": "6-10", "max_results": 12, "followups": 3, "min_words": 1800},
    }
    return {
        "depth": depth,
        "citation_strictness": citation_strictness,
        "human_review_enabled": config.get("human_review_enabled", True) is not False,
        **budgets[depth],
    }


def _extract_text(result: dict[str, Any]) -> str:
    messages = result.get("messages") or []
    for message in reversed(messages):
        content = getattr(message, "content", None)
        if content is None and isinstance(message, dict):
            content = message.get("content")
        if isinstance(content, str) and content.strip():
            return content
        if isinstance(content, list):
            text = "\n".join(
                str(item.get("text") or item.get("content") or "")
                for item in content
                if isinstance(item, dict)
            ).strip()
            if text:
                return text
    return ""


def _extract_json(text: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        return {}
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        try:
            parsed = ast.literal_eval(match.group(0))
        except (ValueError, SyntaxError):
            return {}
    return parsed if isinstance(parsed, dict) else {}


def _normalize_response(result: dict[str, Any]) -> DeepResearchResponse:
    structured = result.get("structured_response")
    if isinstance(structured, DeepResearchResponse):
        return structured
    if isinstance(structured, dict):
        return DeepResearchResponse.model_validate(structured)

    text = _extract_text(result)
    parsed = _extract_json(text)
    if parsed:
        return DeepResearchResponse.model_validate(parsed)

    return DeepResearchResponse(analysis_notes=text, draft_report=text)


def _word_count(text: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", text))


def _evidence_json(records: list[EvidenceRecord], limit: int = 36000) -> str:
    compact = [
        {
            "citation_label": item.get("citation_label"),
            "chunk_id": item.get("chunk_id"),
            "source_id": item.get("source_id"),
            "score": item.get("score"),
            "query": item.get("query"),
            "content": str(item.get("content") or "")[:2200],
            "metadata": item.get("metadata") or {},
        }
        for item in records
    ]
    return json.dumps(compact, ensure_ascii=True)[:limit]


def _expand_short_report(
    state: OrchestratorState,
    response: DeepResearchResponse,
    records: list[EvidenceRecord],
    config: dict[str, Any],
) -> DeepResearchResponse:
    if _word_count(response.draft_report) >= int(config["min_words"]):
        return response

    evidence = _evidence_json(records)
    result = writer_llm(state["owner_user_id"]).invoke_json(
        (
            "Return strict JSON with keys draft_report, analysis_notes, critique_notes, "
            "citation_map, open_questions. Expand the report, but use only supplied "
            "evidence. Do not invent facts. If evidence is sparse, expand the limitations, "
            "method, uncertainty, and follow-up questions instead of unsupported claims."
        ),
        (
            f"Question:\n{state['question']}\n\n"
            f"Minimum report length: {config['min_words']} words.\n"
            "Required markdown sections: Executive Summary, Research Plan, Evidence-Backed "
            "Findings, Evidence Matrix, Contradictions and Gaps, Implications, Open Questions, "
            "Citation Notes.\n\n"
            f"Existing draft:\n{response.draft_report}\n\n"
            f"Existing analysis notes:\n{response.analysis_notes}\n\n"
            f"Existing critique notes:\n{response.critique_notes}\n\n"
            f"Evidence JSON:\n{evidence}"
        ),
    )
    return DeepResearchResponse(
        research_plan=response.research_plan,
        analysis_notes=str(result.get("analysis_notes") or response.analysis_notes),
        critique_notes=str(result.get("critique_notes") or response.critique_notes),
        draft_report=str(result.get("draft_report") or response.draft_report),
        citation_map=result.get("citation_map") or response.citation_map,
        confidence=response.confidence,
        open_questions=[
            str(item)
            for item in (result.get("open_questions") or response.open_questions)
            if str(item).strip()
        ],
    )


def _prompt(config: dict[str, Any]) -> str:
    strictness = config["citation_strictness"]
    return f"""You are Lumina's deep research orchestrator.

Use only the `search_case_evidence` tool for factual evidence. It returns only chunks from the current case and owner.

Workflow:
1. Use write_todos to create a {config["tasks"]} item plan.
2. Save the request to /research_request.md.
3. Delegate focused evidence work to subagents with task().
4. Build /evidence_matrix.md with claim, supporting citation_label, confidence, and gaps.
5. Run a contradiction and gap pass. Use up to {config["followups"]} follow-up retrieval rounds for missing evidence.
6. Write /draft_report.md as a deep professional markdown report of at least {config["min_words"]} words.
7. Return final JSON matching the requested schema.

The draft_report must not be a short summary. It must be a single markdown string (NOT a nested JSON object). It must include these sections using markdown headings (##):
- Executive Summary
- Research Plan
- Evidence-Backed Findings
- Evidence Matrix
- Contradictions and Gaps
- Implications
- Open Questions
- Citation Notes

Citation rules:
- Inline citations must use citation_label values returned by search_case_evidence, such as [1].
- Do not cite unavailable evidence.
- Strictness is {strictness}. If strict, every material claim needs a citation.
- If evidence is weak or absent, state that limitation in critique_notes and open_questions.
"""


def run_deep_research(state: OrchestratorState) -> dict[str, Any]:
    try:
        from deepagents import create_deep_agent
    except ImportError as exc:
        raise RuntimeError(
            "deepagents is required for deep research orchestration"
        ) from exc

    config = _depth_config(state.get("run_config"))
    retriever = SupabaseRetriever(get_supabase())
    all_records: list[EvidenceRecord] = []
    by_chunk_id: dict[str, EvidenceRecord] = {}

    def search_case_evidence(query: str, max_results: int | None = None) -> str:
        """Search indexed evidence for the current Lumina case."""
        limit = max(
            1, min(int(max_results or config["max_results"]), config["max_results"])
        )
        records = retriever.retrieve([query], state["case_id"], state["owner_user_id"])[
            :limit
        ]
        labeled_records: list[EvidenceRecord] = []
        for record in records:
            chunk_id = record.get("chunk_id", "")
            if not chunk_id:
                continue
            if chunk_id not in by_chunk_id:
                labeled = dict(record)
                labeled["citation_label"] = f"[{len(all_records) + 1}]"
                by_chunk_id[chunk_id] = labeled
                all_records.append(labeled)
            labeled_records.append(by_chunk_id[chunk_id])
        compact = [
            {
                "citation_label": item.get("citation_label"),
                "chunk_id": item.get("chunk_id"),
                "source_id": item.get("source_id"),
                "score": item.get("score"),
                "query": item.get("query"),
                "content": str(item.get("content") or "")[:1800],
                "metadata": item.get("metadata") or {},
            }
            for item in labeled_records
        ]
        return json.dumps({"query": query, "results": compact}, ensure_ascii=True)

    research_subagent = {
        "name": "case-evidence-researcher",
        "description": "Finds and summarizes owner-scoped evidence chunks for one focused research question.",
        "system_prompt": (
            "Use only search_case_evidence. Return concise findings with citation_label "
            "references, uncertainty, and missing evidence."
        ),
        "tools": [search_case_evidence],
    }
    critique_subagent = {
        "name": "case-evidence-critic",
        "description": "Checks draft findings for unsupported claims, contradictions, and evidence gaps.",
        "system_prompt": (
            "Audit claims against retrieved case evidence. Flag unsupported claims, "
            "contradictions, and missing citations. Do not add outside facts."
        ),
        "tools": [search_case_evidence],
    }
    agent = create_deep_agent(
        model=chat_model(state["owner_user_id"], "analyzer"),
        tools=[search_case_evidence],
        system_prompt=_prompt(config),
        subagents=[research_subagent, critique_subagent],
        response_format=DeepResearchResponse,
        name="lumina-deep-research",
    )
    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": (
                        f"Case question:\n{state['question']}\n\n"
                        f"Depth: {config['depth']}. Minimum report length: {config['min_words']} words.\n"
                        "Return JSON with research_plan, analysis_notes, critique_notes, "
                        "draft_report, citation_map, confidence, and open_questions."
                    ),
                }
            ]
        },
        config={"configurable": {"thread_id": f"{state['run_id']}:deep-research"}},
    )
    response = _normalize_response(result)
    expanded_short_report = _word_count(response.draft_report) < int(config["min_words"])
    response = _expand_short_report(state, response, all_records, config)
    citation_map = response.citation_map or {
        item.get("citation_label", ""): item.get("chunk_id", "") for item in all_records
    }
    return {
        "research_plan": response.research_plan,
        "retrieved_chunks": all_records,
        "analysis_notes": response.analysis_notes,
        "critique_notes": response.critique_notes,
        "draft_report": response.draft_report,
        "citation_map": citation_map,
        "deep_research_meta": {
            "depth": config["depth"],
            "citation_strictness": config["citation_strictness"],
            "confidence": response.confidence,
            "open_questions": response.open_questions,
            "evidence_count": len(all_records),
            "report_word_count": _word_count(response.draft_report),
            "expanded_short_report": expanded_short_report,
        },
    }
