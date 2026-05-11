# Orchestrator Service Implementation Guide (LangGraph)

This guide is a complete reference for the Orchestrator layer in `services/orchestrator`. It explains **what the layer must contain**, **file layout**, **execution flow**, **standalone execution**, **testing with Postman-like tools**, and **integration with API and website**.

---

## 1) Purpose of This Layer

The Orchestrator manages multi-step AI workflows. It is responsible for reasoning, retrieval, writing, and human review. Unlike the Worker, it is not a simple task runner. It must **store and resume graph state**.

---

## 2) Required Files and Structure

Expected structure inside `services/orchestrator` (minimum viable):

```
services/orchestrator/
  pyproject.toml
  README.md
  main.py
  app/
    __init__.py
    core/
      config.py
      database.py
    graph/
      state.py
      nodes.py
      graph.py
    services/
      retriever.py
      writer.py
    checkpoints/
      postgres.py
```

### What each file should do

- `main.py`
  - Runs the orchestrator consumer loop.
  - Listens for `run_id` tasks.

- `app/core/config.py`
  - Loads env vars (Supabase URL, service key, model keys).

- `app/core/database.py`
  - Supabase client and Postgres connection.

- `app/graph/state.py`
  - Defines `State` TypedDict (messages, case_id, run_id, extracted_facts, report_draft).

- `app/graph/nodes.py`
  - Functions for each graph node: planner, retriever, analyzer, writer, human_review.

- `app/graph/graph.py`
  - Wires nodes together, defines transitions.

- `app/services/retriever.py`
  - Queries `chunks` table with pgvector search.

- `app/services/writer.py`
  - Produces final report output.

- `app/checkpoints/postgres.py`
  - Uses `langgraph-checkpoint-postgres` to save and load state.

---

## 3) Required Code Flow

### 3.1 Run Trigger Flow

Input: `run_id`

1. Fetch `runs` row and `case_id`.
2. Set run status to `running`.
3. Build initial `State`.
4. Invoke LangGraph with thread_id = `run_id`.

### 3.2 Graph Execution

Typical graph path:

1. **planner**: create research plan.
2. **retriever**: fetch chunks from pgvector.
3. **analyzer**: synthesize findings.
4. **writer**: draft report.
5. **human_review**: pause and wait for approval.

When approved, it resumes and finalizes, then marks `runs.status = completed`.

### 3.3 Human Review

- When graph reaches `human_review`, it saves state and exits.
- API exposes an endpoint to resume the run.
- Orchestrator consumes a resume signal and continues execution.

---

## 4) Running the Orchestrator Alone

From `services/orchestrator`:

1. Install dependencies:

```
poetry install
```

2. Run the orchestrator:

```
poetry run python main.py
```

3. Orchestrator listens for tasks from the queue.

---

## 5) Testing with Postman (Standalone)

The Orchestrator has no web server. It is tested by triggering runs through the API.

### Test Flow

1. Create a case.
2. Upload source files and let Worker process them.
3. Start a run with `POST /cases/{case_id}/runs`.
4. Poll `GET /cases/{case_id}/runs/{run_id}`.
5. When status = `awaiting_review`, call `POST /runs/{run_id}/approve` (API route).

---

## 6) Integration Steps

### Integrate with API

- API enqueues orchestrator tasks when a run is created.
- API exposes resume endpoint (`/runs/{run_id}/approve`).

### Integrate with Worker

- Orchestrator reads from `chunks` table (output of Worker).

### Integrate with Website

- Website triggers runs through API.
- Website shows draft report and calls approve endpoint.

---

## 7) Checklist (Orchestrator)

- Orchestrator consumes `run_id` tasks.
- LangGraph graph runs from planner to writer.
- Human review pauses and resumes correctly.
- Runs table updated with `running`, `awaiting_review`, `completed`.
