# AI Research and Decision Workspace Build Guide

## Executive summary

This product is a **single-user AI Research and Decision Workspace** that turns messy inputs (URLs, PDFs, notes) into a **reviewable decision report** with citations, draft versions, approval gates, and durable workflow history.

The implementation foundation is:

- **Next.js App Router** for UI and Backend-for-Frontend (BFF)
- **Python services** for ingestion, retrieval, and orchestration
- **LangGraph (Python)** for stateful AI workflows
- **Supabase Postgres** as the primary database
- **Supabase Auth** for authentication, session handling, and OAuth
- **pgvector** in Supabase Postgres for semantic retrieval
- **Python workers** for background processing
- **OpenTelemetry** for tracing

Core architectural rule:

**Supabase stores state. Python computes. Next.js presents.**

---

## Why this revision

The previous draft mixed single-user app goals with team SaaS concepts (workspaces, memberships, invites, billing). The website implementation is intentionally single-user and local-first in product shape, so this PRD now matches that scope.

This version removes:

- workspace switching
- membership and RBAC tables for multiple users in one tenant
- invite flows
- billing/multi-tenant SaaS assumptions

This version keeps:

- Supabase Auth for identity
- durable case-source-run-report lifecycle
- human-in-the-loop checkpointing in LangGraph
- retrieval and citation traceability

---

## Product scope

### In scope

- Personal case management
- Source ingestion (URL, file, note)
- Chunking + embeddings + retrieval
- Stateful runs with pause/resume checkpoints
- Draft report generation and review
- Publish flow and report version history
- Search over sources/chunks/reports
- Local single-user settings and integrations

### Out of scope

- Multi-user workspaces
- Team permissions and role matrices
- Invitations and member management
- Billing and plan management

---

## Revised assumptions

This PRD assumes:

- One authenticated user owns all records in their account.
- The web app remains in **Next.js App Router**.
- The AI workflow runtime is in **Python LangGraph**.
- **Supabase Postgres** is the source of truth for application state.
- **Supabase Auth** handles sign-in, OAuth, session issuance, and token refresh.
- The browser primarily talks to Next.js BFF endpoints.
- Python services can verify Supabase JWTs or use service credentials for internal trusted jobs.
- Vector search lives in the same Postgres instance using `pgvector`.
- Long-running workflows are checkpointed by LangGraph and persisted through run metadata.

---

## Recommended tech stack

### Product layer

- Next.js App Router
- Tailwind CSS
- Server Components by default
- Route Handlers for APIs/webhooks/SSE
- Server Actions for product mutations where appropriate

### Identity and data layer

- Supabase Postgres
- Supabase Auth
- Supabase OAuth (Google/GitHub first)
- pgvector extension
- Optional Supabase Storage for uploaded files and exports

### AI and workflow layer

- Python 3.11+
- LangGraph (Python)
- Thin LangChain usage where helpful
- Pydantic for state/contracts
- Async worker runtime

### Background execution

Preferred model:

- Next.js writes job/run requests to Postgres
- Python workers consume queued work
- Python owns ingestion and orchestration lifecycle

---

## Architecture

### High-level architecture

1. **Web App / BFF (Next.js)**
   - auth entry points
   - case/source/run/report UI
   - safe browser-facing APIs

2. **Supabase Platform**
   - relational state
   - vector storage and search
   - auth and oauth
   - optional storage buckets
   - optional realtime for run/source/report status updates

3. **Python Worker Services**
   - ingestion pipeline
   - parsing/chunking/embeddings
   - retries and error handling

4. **LangGraph Orchestrator (Python)**
   - create and resume runs
   - retrieval + synthesis + critique + citation checks
   - pause for human review
   - publish transition

### Architectural principle

**Every app row is owned by a single authenticated user (`owner_user_id`).**

This keeps authorization simple today and remains RLS-ready for future enforcement.

---

## Service breakdown

### `apps/website` — Next.js application

Responsibilities:

- sign-in/sign-up/oauth callback
- case and source management UI
- report review and publish UI
- API handlers for browser-safe operations

### `services/worker` — Python ingestion worker

Responsibilities:

- fetch source content
- parse and normalize text
- chunk content
- generate embeddings
- write documents/chunks/state updates to Supabase

### `services/orchestrator` — Python LangGraph service

Responsibilities:

- start/resume runs
- retrieve evidence and synthesize report drafts
- run critique and citation validation
- persist run steps and artifacts
- pause/resume for human checkpoints
- publish report versions

### `supabase`

Responsibilities:

- schema and migrations
- extensions and indexes
- optional RLS policies

---

## Data model (single-user)

### Core entities

#### `profiles`

Mirror metadata for authenticated users (linked to Supabase auth user id).

#### `cases`

Research unit.

Suggested fields:

- `id`
- `owner_user_id`
- `title`
- `question`
- `status` (`draft`, `ingesting`, `indexed`, `analyzing`, `review`, `published`, `failed`, `archived`)
- `priority`
- `tags`
- `created_at`, `updated_at`, `archived_at`

#### `sources`

URL/file/note inputs for a case.

Suggested fields:

- `id`
- `case_id`
- `owner_user_id`
- `source_type` (`url`, `file`, `note`)
- `url`
- `storage_path`
- `note_text`
- `status` (`pending`, `fetching`, `extracting`, `chunking`, `embedding`, `indexed`, `failed`, `archived`)
- `error_message`
- `content_hash`
- `created_at`, `updated_at`

#### `documents`

Normalized extracted content derived from sources.

#### `chunks`

Retrievable text chunks with vector embeddings.

Suggested fields:

- `id`
- `document_id`
- `case_id`
- `owner_user_id`
- `chunk_index`
- `content`
- `token_count`
- `embedding` (pgvector)
- `metadata_json`

#### `runs`

Execution instances of the LangGraph workflow.

Suggested fields:

- `id`
- `case_id`
- `owner_user_id`
- `status` (`queued`, `running`, `needs_review`, `resuming`, `complete`, `failed`, `cancelled`)
- `current_step`
- `needs_review`
- `checkpoint_ref`, `checkpoint_at`
- `started_at`, `completed_at`
- `error_message`
- `approved_by_user_id`, `approved_at`

#### `run_steps`

Node-level trace for each run.

#### `run_artifacts`

Structured outputs from run steps (retrieval sets, critique notes, validation, traces).

#### `report_versions`

Versioned report artifacts.

Suggested fields:

- `id`
- `case_id`
- `run_id`
- `owner_user_id`
- `version_number`
- `status` (`draft`, `published`, `archived`)
- `content_markdown`
- `citations_json`
- `published_at`
- `created_at`

#### `report_claims`

Structured claim units for explainability and citation linking.

#### `report_citations`

Citation records linking report evidence to source/document/chunk.

#### `ingestion_attempts`

Per-source retry history and per-stage outcomes.

#### `jobs`

Queue table for background work.

#### `audit_logs`

Audit trail for entity lifecycle and sensitive actions.

---

## End-to-end workflow

### Lifecycle

A Case moves through:

- **Draft**
- **Ingesting**
- **Indexed**
- **Analyzing**
- **Review**
- **Published**

### Sequence

1. User creates a case in Next.js
2. Next.js writes case metadata to Supabase
3. User adds sources (URL/file/note)
4. Python ingestion worker processes sources
5. Documents/chunks/embeddings are persisted
6. User starts analysis
7. Python LangGraph run executes with checkpoints
8. Draft report is saved into `report_versions`
9. User reviews and approves
10. Orchestrator resumes and publishes final version

---

## LangGraph design (Python)

### Recommended nodes

1. `plan_research`
2. `retrieve_evidence`
3. `synthesize_report`
4. `critique_report`
5. `verify_citations`
6. `await_human_review`
7. `publish_report`

### State model

Suggested state fields:

- `run_id`
- `case_id`
- `question`
- `research_plan`
- `retrieved_chunks`
- `draft_report`
- `citation_map`
- `critique_notes`
- `review_status`
- `final_report`

### Interrupt model

The run pauses at `await_human_review`:

- graph marks run as `needs_review`
- Next.js shows review UI
- user edits/approves/rejects
- orchestrator resumes from checkpoint
- publish node persists final report version

---

## API boundaries

### Browser -> Next.js

Examples:

- create case
- add source
- trigger run
- approve report
- fetch run/report state

### Next.js -> Supabase

Use Supabase clients for authenticated data access and secure mutations.

### Next.js -> Python services

Use internal calls for:

- triggering ingestion
- starting/resuming runs
- health checks

### Python -> Supabase

Python writes:

- source ingestion state
- documents/chunks/embeddings
- run and run step states
- report versions and citations

---

## Authentication and authorization

### Authentication

Supabase Auth handles:

- sign-up/sign-in
- OAuth login
- session issuance
- token refresh

### Authorization

Single-user ownership rule:

- every row includes `owner_user_id`
- app-level checks enforce ownership on reads/writes
- optional RLS can enforce `owner_user_id = auth.uid()` at DB level

---

## Ingestion pipeline

### Inputs

- URLs
- uploaded PDFs
- raw notes

### Python ingestion steps

1. fetch source
2. detect content type
3. parse text
4. normalize structure
5. chunk content
6. compute embeddings
7. write documents/chunks
8. update source/case status

---

## Observability

Instrument:

- Next.js request lifecycle
- ingestion jobs
- embedding and retrieval stages
- LangGraph node execution
- pause/resume checkpoints
- publish transitions

Trace dimensions:

- `user_id`
- `case_id`
- `run_id`
- `source_id` (when relevant)

---

## Security model

Core rules:

1. Browser only calls safe product endpoints
2. Python internals are private
3. Service credentials stay server-side
4. Ownership checks run on every read/write path
5. Reports preserve citation provenance

Never expose to browser:

- Supabase service role key
- model provider keys
- internal service secrets

---

## Roadmap

### Phase 1 — Product skeleton

Build:

- Supabase project and auth
- Next.js shell and auth pages
- case CRUD

Deliverable:

- user signs in and creates case

### Phase 2 — Ingestion and indexing

Build:

- URL/file/note source flows
- Python ingestion worker
- chunking + embeddings
- status transitions

Deliverable:

- case reaches `indexed`

### Phase 3 — LangGraph workflow

Build:

- orchestrator graph
- retrieval/synthesis/critique/citation checks
- draft persistence

Deliverable:

- reviewable draft report generated

### Phase 4 — Human review and publish

Build:

- review UI
- approve/edit/reject actions
- resume from checkpoint
- publish and versioning

Deliverable:

- user publishes grounded report

### Phase 5 — Hardening

Build:

- optional RLS policies
- retries and idempotency
- richer observability
- evaluation harness
- rate limiting

---

## Final recommendation

The strongest fit for this project remains:

- **Next.js** for product UI and BFF
- **Supabase** for Postgres and auth
- **Python LangGraph** for AI orchestration

For current scope, keep the system strictly **single-user** and optimize reliability across the case -> source -> run -> report lifecycle. Multi-user SaaS constructs can be layered later only if product direction changes.
