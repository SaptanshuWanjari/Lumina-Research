# Backend Implementation Guide

This document provides step-by-step instructions for implementing the remaining Python backend services for the AI Research and Decision Workspace.

## Phase 2: FastAPI Service (`services/api`) (Remaining)

You already have the core FastAPI structure (`main.py`, `config.py`, `security.py`, `database.py`) and the `cases` router. Here is how to implement the rest.

### 1. Sources Router (`app/api/endpoints/sources.py`)
This router handles document uploads for specific cases.

**Requirements:**
- **Endpoint:** `POST /cases/{case_id}/sources`
- **Logic:**
  1. Validate that `case_id` belongs to `owner_user_id` (via Supabase client).
  2. Accept file uploads (e.g., PDF, TXT) using `fastapi.UploadFile`.
  3. Upload the file to the Supabase Storage bucket (`sources`).
  4. Create a record in the `sources` Postgres table.
  5. Enqueue a job to the Worker service to process/chunk the document.

### 2. Runs Router (`app/api/endpoints/runs.py`)
This router handles triggering the LangGraph research runs.

**Requirements:**
- **Endpoint:** `POST /cases/{case_id}/runs`
- **Logic:**
  1. Validate ownership of `case_id`.
  2. Insert a new record into the `runs` table with `status = 'pending'`.
  3. Enqueue a job to the Orchestrator service to start the LangGraph workflow for this `run_id`.
- **Endpoint:** `GET /cases/{case_id}/runs/{run_id}`
  - Returns the status of a specific run.

---

## Phase 3: Worker Service (`services/worker`)

The worker service is responsible for heavy asynchronous tasks, specifically document ingestion and chunking (RAG preparation).

### 1. Setup
- Use `celery`, `arq`, or a simple `asyncio` task queue. 
- Ensure `pydantic-settings` and `supabase` are installed.

### 2. Ingestion Task (`tasks/ingestion.py`)
**Requirements:**
- Input: `source_id`
- Logic:
  1. Fetch the source record and file from Supabase Storage.
  2. Parse the document (e.g., using `PyMuPDF` for PDFs or `unstructured`).
  3. Chunk the text into meaningful segments (e.g., using LangChain's `RecursiveCharacterTextSplitter`).
  4. Generate embeddings for each chunk using an embedding model (e.g., `text-embedding-3-small`).
  5. Insert the chunks and embeddings into the `chunks` table (pgvector) in Supabase.
  6. Update the `sources` table status to `processed`.

---

## Phase 4: LangGraph Orchestrator (`services/orchestrator`)

This service runs the complex multi-agent reasoning loops.

### 1. Core LangGraph Setup (`graph.py`)
**Requirements:**
- Define the state: `TypedDict` containing `messages`, `case_id`, `run_id`, `extracted_facts`, `report_draft`.
- Define nodes:
  - `planner`: Creates a research plan based on case settings.
  - `retriever`: Queries the `chunks` table in Supabase via pgvector.
  - `analyzer`: Synthesizes retrieved chunks into findings.
  - `writer`: Drafts the final report.
  - `human_review`: A "Wait" node that pauses execution until human approval.

### 2. Postgres Checkpointer
- Use `langgraph-checkpoint-postgres` to save the state of the graph.
- This allows the graph to pause at the `human_review` node and be resumed via an API call from the FastAPI service once the user approves the draft in the Next.js frontend.

### 3. Execution Wrapper (`main.py`)
- Set up a consumer (similar to the worker service) that listens for new runs.
- When triggered, invoke the LangGraph workflow using `app.invoke(input_state, config={"configurable": {"thread_id": run_id}})`.
- Update the `runs` table status in Supabase as the graph progresses (e.g., `running`, `awaiting_review`, `completed`).

---

## Critical Rule: RLS & Ownership
Whenever you write database queries using the Supabase Service Role key in Python, you MUST include `.eq('owner_user_id', user_id)`:

```python
# DO THIS:
supabase.table('cases').select('*').eq('id', case_id).eq('owner_user_id', user_id).execute()

# NEVER DO THIS:
supabase.table('cases').select('*').eq('id', case_id).execute()
```