# 05. LangGraph Orchestrator (`services/orchestrator`)

## Role and Responsibilities
The `services/orchestrator` is the core AI service that executes complex multi-agent reasoning loops. It is implemented in Python using the LangGraph framework. Its primary task is taking an indexed `case`, retrieving relevant chunks from the database using vector search, synthesizing a draft report, pausing for human review, and finally publishing the report.

## Architecture
- **Framework:** `langgraph`, `langchain`, `pydantic`.
- **Database:** Supabase (PostgreSQL with pgvector for retrieval).
- **Checkpointer:** `langgraph-checkpoint-postgres`. Essential for pausing and resuming workflows (human-in-the-loop).

## The State Model
A `TypedDict` or `Pydantic` model representing the state of the graph at any given node.
- `run_id`: UUID
- `case_id`: UUID
- `owner_user_id`: UUID
- `question`: string (from the case)
- `research_plan`: list of strings (sub-questions)
- `retrieved_chunks`: list of dicts (chunks + metadata)
- `draft_report`: string (markdown)
- `citation_map`: dict (linking claims to chunk IDs)
- `critique_notes`: string
- `review_status`: string (approved, rejected, needs_edits)
- `final_report`: string (markdown)

## The Nodes (Graph Workflow)
The LangGraph workflow consists of the following nodes:

1.  `plan_research`:
    *   **Input:** `question`
    *   **Action:** LLM analyzes the case question and breaks it down into a list of specific sub-queries (`research_plan`).
2.  `retrieve_evidence`:
    *   **Input:** `research_plan`
    *   **Action:** For each sub-query, convert it to an embedding (e.g., `text-embedding-3-small`) and perform a cosine similarity search against the `chunks` table in Supabase.
    *   **CRITICAL RULE:** The vector search query MUST filter by `case_id` AND `owner_user_id`.
3.  `synthesize_report`:
    *   **Input:** `retrieved_chunks`
    *   **Action:** LLM writes a comprehensive draft report addressing the `question` using *only* the retrieved evidence. It must generate inline citations (e.g., `[1]`, `[2]`) that correspond to the `retrieved_chunks`. Output is saved to `draft_report`.
4.  `critique_report` (Optional but recommended):
    *   **Action:** A secondary LLM pass (or a different persona) reviews the draft against the original question. If gaps are found, it populates `critique_notes` and potentially loops back to `retrieve_evidence` (if LangGraph edges are configured for looping).
5.  `verify_citations`:
    *   **Action:** A strict validation step ensuring every claim in the `draft_report` is backed by a specific chunk in `retrieved_chunks`. Generates a structured `citation_map`.
6.  `await_human_review`:
    *   **Action:** This is a LangGraph "Wait" node. The orchestrator explicitly interrupts the graph.
    *   **Side Effect:** Updates the `runs` table in Supabase: `status = needs_review`, `needs_review = true`. Saves the draft to `report_versions` as `status = draft`.
    *   **Resume:** The API (triggered by Next.js) will call the checkpointer to resume the thread once the user approves/edits the draft in the UI.
7.  `publish_report`:
    *   **Input:** The final (potentially user-edited) `draft_report`.
    *   **Action:** Generates final markdown and structured JSON. Updates the `report_versions` table: `status = published`. Updates `runs` table: `status = complete`.

## State Persistence (Postgres Checkpointer)
- The orchestrator uses `langgraph.checkpoint.postgres` to save the state after every node execution into a dedicated schema/table (managed by the LangGraph library).
- The `thread_id` used to initialize the checkpointer should be the `run_id`.
- The frontend (via the FastAPI Gateway) can interact with this checkpointer to resume a `needs_review` run by providing the `run_id` and the user's approval input.

## Database Interaction Rule
When fetching data (e.g., in `retrieve_evidence`), always enforce ownership:
```python
# pgvector similarity search via Supabase RPC or direct SQL
response = supabase.rpc(
    "match_chunks",
    {
        "query_embedding": embedding,
        "match_threshold": 0.7,
        "match_count": 5,
        "filter_case_id": case_id,
        "filter_owner_id": user_id  # CRITICAL
    }
).execute()
```
*(Note: A custom Postgres function like `match_chunks` will need to be written in the Supabase migrations to handle the vector math and filtering).*