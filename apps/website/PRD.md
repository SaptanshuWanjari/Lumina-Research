# AI Research & Decision Workspace Build Guide (Python + LangGraph + Supabase)

## Executive summary

An **AI Research & Decision Workspace** is a portfolio-grade system that turns messy inputs (URLs, PDFs, notes) into a **reviewable decision report** with citations, drafts, approval gates, and a durable workflow history.

This revision keeps the original product goal intact, but changes the implementation foundation to:

- **Next.js App Router** for the UI and Backend-for-Frontend (BFF)
- **Python services** for ingestion, retrieval, and orchestration
- **LangGraph (Python)** for stateful AI workflows
- **Supabase Postgres** as the primary database
- **Supabase Auth** for authentication, session handling, and OAuth
- **pgvector on Supabase Postgres** for semantic retrieval
- **Redis + BullMQ or Python workers** for background tasks, depending on how much polyglot complexity you want
- **OpenTelemetry** for tracing across web, workers, and AI orchestration

The key architectural shift is this:

- Keep **Next.js** for the product surface and BFF
- Move the **AI workflow layer** from TypeScript LangGraph to **Python LangGraph**
- Replace standalone Postgres/Auth.js with **Supabase Postgres + Supabase Auth/OAuth**

That gives you a cleaner split:

- **Frontend/product experience:** Next.js
- **Identity/data platform:** Supabase
- **AI/runtime orchestration:** Python

This is a stronger architecture than the original for an AI-heavy system, because Python has the best ergonomics for LangGraph, retrieval pipelines, evaluation tooling, document parsing, and experimentation, while Supabase removes a large amount of auth and database boilerplate.

---

## Why this revision

The original draft leaned heavily on a TypeScript-everywhere stack. That is workable, but for this product the most important layer is the **stateful AI workflow**. For that layer, Python is usually the better long-term choice because:

- the Python LangGraph ecosystem is more mature in practice for agent workflows
- most AI tooling, eval libraries, parsing libraries, and research utilities are Python-first
- prompt iteration, graph debugging, and offline evaluation are easier in Python
- background AI workflows and ingestion jobs are more natural to run in Python workers than inside a Node-centric application boundary

At the same time, the original stack made auth and core data management more complex than necessary. Supabase solves a lot of that immediately:

- managed Postgres
- built-in auth
- built-in OAuth providers
- row-level security support
- file storage if needed for uploads
- realtime capabilities if later needed for run progress or collaboration

So the revised stack is intentionally **hybrid**:

- **Next.js** where it shines: product UI, BFF, server-rendered app experience
- **Supabase** where it shines: identity, Postgres, storage, policies
- **Python** where it shines: AI workflow execution

---

## Revised assumptions

This PRD assumes:

- You still want a **monorepo-style developer experience** even if services are split by language.
- The user-facing app remains in **Next.js App Router**.
- The main AI workflow runtime is implemented in **Python**, not TypeScript.
- **Supabase Postgres** is the source of truth for application state.
- **Supabase Auth** handles:
  - email/password auth if enabled
  - magic link if enabled
  - OAuth providers such as Google/GitHub
  - sessions and token issuance
- The browser primarily talks to the **Next.js BFF**, not directly to internal Python services.
- Python services may verify Supabase JWTs when called from the BFF.
- Vector search is stored in the same **Supabase Postgres** instance using `pgvector`.
- Background tasks are handled by workers, and long-running AI workflows are checkpointed in LangGraph.

---

## Revised recommended tech stack

### Product layer

- **Next.js App Router**
- Tailwind CSS
- Server Components by default
- Route Handlers for APIs/webhooks/SSE
- Server Actions for product mutations where appropriate

### Identity and data layer

- **Supabase Postgres**
- **Supabase Auth**
- **Supabase OAuth**
- **pgvector** extension in Postgres
- Optional **Supabase Storage** for uploaded files and source artifacts

### AI and workflow layer

- **Python 3.11+**
- **LangGraph (Python)**
- **LangChain Python** where useful, but keep it thin
- Pydantic for structured state and validation
- Async Python worker runtime

### Background execution

Two valid approaches:

#### Option A: Simpler hybrid model
- Next.js app enqueues jobs into Redis/BullMQ
- Python workers consume jobs or are triggered by internal APIs

#### Option B: Cleaner Python-first execution model
- Next.js writes jobs/run requests into Supabase/Postgres
- Python worker polls or consumes from a queue
- Python owns ingestion + AI orchestration end to end

For this product, **Option B is cleaner**. The original BullMQ direction is okay, but once your AI layer is Python, it is often better to let Python own the workflow lifecycle instead of bouncing orchestration across Node and Python.

---

## Revised architecture

### High-level architecture

You will build four main layers:

1. **Web App / BFF (Next.js)**
   - authentication entry points using Supabase
   - workspace and case management UI
   - report review and approval UI
   - BFF endpoints for browser-safe access to backend capabilities

2. **Supabase Platform**
   - Postgres relational data
   - pgvector embeddings
   - Auth and OAuth
   - optional Storage buckets
   - optional Realtime subscriptions

3. **Python Worker Services**
   - source ingestion
   - parsing and chunking
   - embeddings
   - retrieval pipelines
   - evaluation and validation tasks

4. **LangGraph Orchestrator (Python)**
   - durable research workflows
   - checkpointed state
   - human approval interrupts
   - draft generation
   - citation verification
   - publish transition

### Architectural principle

The most important design decision is:

**Supabase stores state. Python computes. Next.js presents.**

That keeps responsibilities crisp:

- Next.js should not become the AI execution engine
- Python should not become the user-facing product shell
- Supabase should remain the durable system of record

---

## Revised service breakdown

### 1. `apps/web` — Next.js application

Responsibilities:

- Sign-in / sign-up / OAuth callback flows
- Workspace/project/case pages
- Source submission UI
- Review and publish UI
- Route Handlers for internal APIs
- SSE endpoints for progress streaming if desired

### 2. `services/worker` — Python ingestion worker

Responsibilities:

- fetch URLs
- parse documents
- extract text
- normalize content
- split into chunks
- compute embeddings
- write chunks + vectors to Supabase Postgres

### 3. `services/orchestrator` — Python LangGraph service

Responsibilities:

- create and resume research runs
- retrieve evidence
- synthesize report drafts
- run critique and citation validation
- pause for human review
- resume after approval
- publish outputs

### 4. `supabase`

Responsibilities:

- users, memberships, workspaces
- cases, sources, documents, chunks
- AI runs, checkpoints metadata, report versions
- auth, OAuth, tokens, policies

---

## Why Supabase is a better fit here

The original doc treated database and authentication as separate concerns with more implementation burden. For this revised build, Supabase should handle both.

### Supabase DB

Use Supabase Postgres for:

- `workspaces`
- `workspace_members`
- `projects`
- `cases`
- `sources`
- `documents`
- `chunks`
- `ai_runs`
- `report_versions`
- `audit_logs`

### Supabase Auth + OAuth

Use Supabase Auth for:

- email/password auth if you want it
- passwordless magic links if you want them
- OAuth sign-in with providers like Google or GitHub
- session tokens for the web app
- identity bootstrap for workspace membership

This is much better than wiring a custom auth model early, because auth is rarely the core learning objective of this project. The core learning objective is reliable AI workflow construction.

### Supabase Storage

Use it when you need:

- uploaded PDFs
- raw source files
- generated export artifacts
- optional versioned attachments

### Row-level security

Supabase makes it natural to add RLS later for workspace isolation. Even if you start with application-level authorization checks, the data model should be designed so RLS can be introduced cleanly.

---

## Revised data model

### Core entities

#### `workspaces`
Represents a team or personal environment.

#### `workspace_members`
Maps users to workspaces with roles such as:
- owner
- editor
- reviewer
- viewer

#### `cases`
A research or decision unit.

Suggested fields:
- `id`
- `workspace_id`
- `title`
- `question`
- `status` (`draft`, `ingesting`, `indexed`, `analyzing`, `review`, `published`, `failed`)
- `created_by`
- `created_at`
- `updated_at`

#### `sources`
Represents URLs, uploaded files, or notes attached to a case.

Suggested fields:
- `id`
- `case_id`
- `source_type` (`url`, `file`, `note`)
- `url`
- `storage_path`
- `status`
- `error_message`
- `content_hash`
- `created_at`

#### `documents`
Normalized extracted content from each source.

#### `chunks`
Retrievable text chunks with embeddings.

Suggested fields:
- `id`
- `case_id`
- `document_id`
- `chunk_index`
- `content`
- `token_count`
- `embedding`
- `metadata_json`

#### `ai_runs`
Represents an execution of the research workflow.

Suggested fields:
- `id`
- `case_id`
- `status`
- `current_step`
- `started_at`
- `completed_at`
- `error_message`
- `approved_by`
- `approved_at`

#### `report_versions`
Versioned report artifacts.

Suggested fields:
- `id`
- `case_id`
- `ai_run_id`
- `version_number`
- `status` (`draft`, `published`)
- `content_markdown`
- `citations_json`
- `created_by`
- `created_at`

---

## Revised end-to-end workflow

### Lifecycle

A Case moves through:

- **Draft**
- **Ingesting**
- **Indexed**
- **Analyzing**
- **Review**
- **Published**

### Revised sequence

1. User creates a case in Next.js
2. Next.js stores case metadata in Supabase Postgres
3. User adds sources (URLs, files, notes)
4. Python ingestion worker processes sources
5. Chunks and embeddings are stored in Supabase Postgres
6. User starts analysis
7. Python LangGraph workflow runs with checkpoints
8. Draft report is stored in `report_versions`
9. Human reviews and approves
10. Workflow resumes and publishes final version

---

## Revised LangGraph design (Python)

This is the most important part of the rewrite.

The original PRD described a TypeScript LangGraph layer. Replace that with a **Python LangGraph workflow service**.

### Why Python LangGraph here

Use Python LangGraph because the orchestration layer benefits from:

- easier experimentation
- easier document tooling integration
- stronger ecosystem for evaluation and offline analysis
- cleaner interop with Python-native retrieval and parsing libraries

### Recommended graph nodes

Define the graph roughly as:

1. `plan_research`
2. `retrieve_evidence`
3. `synthesize_report`
4. `critique_report`
5. `verify_citations`
6. `await_human_review`
7. `publish_report`

### State model

Use a strongly typed state object, for example with Pydantic.

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

The graph should pause at `await_human_review`.

The product flow should work like this:

- Python graph writes a draft report and marks the run as `needs_review`
- Next.js shows the draft in the review UI
- Reviewer edits or approves
- Next.js updates Supabase state
- Python orchestrator resumes the graph
- Publish node creates the final report version

This is much better than building a manual state machine in the web tier.

---

## Recommended repo structure

A good revised layout would be:

```text
ai-research-workspace/
  apps/
    web/                    # Next.js App Router
  services/
    worker/                 # Python ingestion/indexing worker
    orchestrator/           # Python LangGraph workflow service
  packages/
    shared-types/           # shared schemas/contracts (OpenAPI/JSON Schema)
  supabase/
    migrations/
    seed/
    policies/
  infra/
    docker/
    otel/
  docs/
```

### Why this layout is better than TS-only

Because it reflects the real system boundary:

- web app
- compute services
- database/auth platform

That is more honest and easier to scale than forcing all concerns into a TypeScript monorepo just for language consistency.

---

## API boundary design

### Browser to Next.js

The browser should mostly talk to Next.js only.

Examples:
- create case
- add source
- trigger run
- approve report
- fetch review state

### Next.js to Supabase

Use Supabase client libraries in Next.js for:
- authenticated reads/writes
- session-aware app data
- server-side protected operations

### Next.js to Python services

Use internal service calls for:
- triggering ingestion
- triggering or resuming a LangGraph run
- checking worker health

### Python to Supabase

Python services should read and write directly to Supabase Postgres for:
- source processing state
- chunk storage
- AI run state
- report versions

Python services may also verify Supabase JWTs or use service-role credentials where appropriate for internal trusted execution.

---

## Revised authentication flow

### Auth responsibilities

Supabase Auth should fully handle:

- sign-up
- sign-in
- OAuth login
- session issuance
- refresh tokens
- user identity

### OAuth

Make OAuth first-class from the beginning.

Recommended providers to support first:
- Google
- GitHub

This matters because for a portfolio-grade team workspace, OAuth reduces friction dramatically.

### Authorization

Do not confuse auth with authorization.

Supabase Auth answers:
- who is this user?

Your app logic and later RLS answer:
- what can this user do in this workspace?

### Recommended authorization model

At minimum:
- workspace owner
- workspace editor
- workspace reviewer
- workspace viewer

Use application-level checks in MVP, then optionally enforce with RLS.

---

## Revised ingestion pipeline

### Inputs

- URLs
- uploaded PDFs
- raw notes

### Python ingestion responsibilities

1. fetch source
2. detect content type
3. parse text
4. normalize structure
5. chunk content
6. compute embeddings
7. write chunks to Supabase Postgres
8. mark source and case progress

### Why Python for ingestion

This is another place where Python is the better fit. Parsing and normalization usually grow in complexity faster than expected, and Python gives you more room to evolve.

---

## Revised background execution strategy

### Best recommendation

For this stack, prefer **Python-owned workers and orchestration**.

The original PRD used BullMQ as a central mechanism. You can still do that, but once the AI runtime is Python, forcing the job brain into Node is unnecessary friction.

A cleaner model is:

- Next.js writes state changes
- Python workers observe or are notified
- Python executes ingestion and orchestration
- Supabase is the durable state layer

### Practical MVP choices

#### Choice 1: Postgres-driven job table
Use a `jobs` table in Supabase and let Python workers poll.

Pros:
- simple infra
- fewer moving parts
- easy local development

Cons:
- less elegant throughput scaling than a dedicated queue

#### Choice 2: Redis queue with Python consumers
Use Redis as a queue backend for Python workers.

Pros:
- better throughput
- more traditional async worker model

Cons:
- extra infra component

For an MVP, **Postgres-driven jobs are acceptable**. For scale, move to Redis or a dedicated workflow engine.

---

## Revised observability

Instrument:

- Next.js request lifecycle
- source ingestion jobs
- embedding steps
- retrieval steps
- LangGraph node execution
- human review pause/resume

### Trace correlation

Every important execution should carry:
- `workspace_id`
- `case_id`
- `run_id`
- `source_id` when relevant

This makes debugging much easier than relying only on logs.

---

## Revised security model

### Core rules

1. Browser only talks to safe product endpoints
2. Internal Python services are not exposed publicly unless necessary
3. Service credentials stay server-side only
4. Workspace authorization is enforced on every read/write path
5. Generated reports must keep citation provenance

### Sensitive credentials

Keep these out of the browser:
- Supabase service role key
- model provider keys
- internal service secrets

### File access

If you store uploaded documents in Supabase Storage, ensure access paths are workspace-aware and not globally public unless intentionally designed that way.

---

## Revised phased roadmap

## Phase 1 — Product skeleton

Goal: create a usable workspace app with auth.

Build:
- Supabase project
- Supabase Auth with OAuth
- Next.js app shell
- workspace and case CRUD
- role-aware membership model

Deliverable:
- users can sign in and create a case

## Phase 2 — Ingestion and indexing

Goal: source data becomes retrievable evidence.

Build:
- URL and file sources
- Python ingestion worker
- chunking pipeline
- embeddings in Supabase Postgres
- case status transitions

Deliverable:
- a case can become `indexed`

## Phase 3 — LangGraph workflow

Goal: generate a reviewable draft.

Build:
- Python LangGraph orchestrator
- retrieval node
- synthesis node
- critique node
- citation verifier node
- draft persistence

Deliverable:
- a case can produce a reviewable draft report

## Phase 4 — Human-in-the-loop review

Goal: make the system trustworthy.

Build:
- review UI in Next.js
- approve/edit/reject actions
- graph resume flow
- publish logic
- report version history

Deliverable:
- users can approve and publish grounded reports

## Phase 5 — Production hardening

Build:
- RLS policies
- better retries and idempotency
- improved observability
- evaluation harnesses
- rate limiting
- export/share flows

---

## Final recommendation

The strongest version of this project is **not** “TypeScript everywhere.”

It is:

- **Next.js** for the product and BFF
- **Supabase** for Postgres, auth, and OAuth
- **Python LangGraph** for the AI orchestration layer

That architecture is more realistic, more maintainable for an AI-heavy application, and more aligned with where complexity will actually grow.

If you optimize this project around the hardest thing you are building, optimize around the **AI workflow runtime**, not around language uniformity.

That is why this rewrite moves the PRD to a **Python LangGraph layer** and makes **Supabase DB + Supabase Auth/OAuth** foundational.

---

## Summary of changes from the original PRD

This revision changes the original guide by:

- replacing the **TypeScript LangGraph layer** with a **Python LangGraph orchestration service**
- replacing the standalone Postgres/Auth.js posture with **Supabase Postgres + Supabase Auth + OAuth**
- shifting worker ownership toward **Python services**
- treating Supabase as the durable platform for app state, identity, and storage
- keeping Next.js as the user-facing app and BFF rather than the AI execution runtime

The original PRD established the product goal and architectural depth well. This revised version keeps that intent, but changes the implementation to a stack that is better suited for AI-heavy systems. Source basis: fileciteturn0file0

