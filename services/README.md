# Backend Architecture & API Structure

This document details the backend architecture for the **AI Research and Decision Workspace**, following the core principle:

**Supabase stores state. Python computes. Next.js presents.**

## System Overview

The backend is composed of three primary Python services designed to handle compute-heavy AI tasks and background ingestion. Next.js (the frontend) communicates with Supabase directly for most UI state and invokes the Python backend for heavy lifting.

```mermaid
graph TD
    UI[Next.js App] --> |Direct State Queries| SB[(Supabase Postgres)]
    UI --> |Trigger AI Tasks via BFF| API[services/api (FastAPI)]

    API --> |Write Run/Job Intent| SB

    W[services/worker] --> |Poll/Listen for Pending Sources| SB
    W --> |Extract, Chunk, Embed| SB

    O[services/orchestrator] --> |Listen for Pending Runs| SB
    O --> |Execute LangGraph Workflows| LLM[OpenAI / LLMs]
    O --> |Read/Write Chunks & State| SB
```

## Directory Structure

```
services/
├── api/                  # FastAPI Application
│   ├── pyproject.toml    # Dependencies (fastapi, pydantic, etc.)
│   ├── main.py           # Entrypoint
│   ├── routers/          # API endpoints (/ingest, /runs)
│   └── dependencies.py   # Supabase JWT Auth Validation
│
├── worker/               # Background Ingestion Worker
│   ├── pyproject.toml
│   ├── main.py           # Worker loop
│   ├── extractors/       # PDF, URL, Note parsers
│   ├── chunking/         # Text splitters
│   └── embeddings/       # pgvector embedding generation
│
└── orchestrator/         # LangGraph AI Workflows
    ├── pyproject.toml
    ├── main.py           # Execution entrypoint
    ├── graph/            # LangGraph Nodes & Edges
    │   ├── nodes.py      # plan, retrieve, synthesize, critique, publish
    │   ├── state.py      # TypedDict / Pydantic states
    │   └── builder.py    # Graph compiler & checkpointer
    └── tools/            # LLM Tool bindings
```

## Service Details

### 1. `services/api` (The Gateway)

A FastAPI application that acts as the synchronous interface for the Next.js App Router (BFF).

- **Responsibilities:**
  - Start/Resume LangGraph Runs.
  - Trigger single-source ingestion tasks.
  - Expose health checks.
- **Security:**
  - Validates `Authorization` headers containing Supabase JWTs.
  - Ensures the user requesting the action is the `owner_user_id` of the relevant `case_id`.

### 2. `services/worker` (The Ingestion Engine)

A background Python process that watches for new sources needing processing.

- **Responsibilities:**
  - Scrape URLs, parse PDFs, and sanitize text notes.
  - Chunk documents into retrievable segments.
  - Generate embeddings and write to the `chunks` table (pgvector).
  - Update the `sources` table status (`fetching` -> `extracting` -> `chunking` -> `embedding` -> `indexed` or `failed`).

### 3. `services/orchestrator` (The AI Brain)

A Python service executing stateful LangGraph workflows.

- **Responsibilities:**
  - Compile the LangGraph orchestrator graph (`plan_research` -> `retrieve_evidence` -> `synthesize_report` -> `critique_report` -> `await_human_review` -> `publish_report`).
  - Read `chunks` and evidence from Supabase.
  - Persist workflow checkpoints to Postgres (allowing pause/resume).
  - Write draft and published reports to `report_versions`.

## Authentication & Ownership

- All entities (`cases`, `sources`, `chunks`, `runs`, `report_versions`) belong to a single user (`owner_user_id`).
- Python services enforce ownership checks programmatically. The API validates the user token, and the Orchestrator/Worker (which may run using Supabase Service Keys) strictly filter operations by `owner_user_id`.

## Next Steps for Implementation

1. **Database Schema:** Apply Supabase migrations for `cases`, `sources`, `runs`, and `chunks` (with pgvector).
2. **API Auth:** Implement Supabase JWT validation dependency in `services/api/dependencies.py`.
3. **Ingestion Pipeline:** Stub out the `worker` loop to fetch and parse a single URL.
4. **LangGraph Scaffold:** Build a basic LangGraph execution in `orchestrator` that simply generates a "hello world" report draft from an input string, and saves it to Postgres.
