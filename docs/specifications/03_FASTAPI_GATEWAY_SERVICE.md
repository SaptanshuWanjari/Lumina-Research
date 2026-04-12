# 03. FastAPI Gateway Service (`services/api`)

## Role and Responsibilities
The `services/api` component acts as the backend API Gateway for the Next.js frontend application. It leverages the FastAPI framework to securely communicate with the Supabase database and enqueue jobs for the Python `worker` and `orchestrator` services.

## Authentication and Security
- **Strict User Isolation:** The API authenticates requests by validating JWT tokens issued by Supabase Auth (`SUPABASE_JWT_SECRET`). It extracts the `sub` claim (the user's unique `owner_user_id`).
- **Authorization Enforcement:** EVERY database query executed via the Supabase Python Client (which uses the Service Role Key) MUST append `.eq("owner_user_id", current_user_id)`. Failing to do so violates the single-user tenancy rule.
- **CORS:** Must be configured to allow origins from the Next.js frontend (`http://localhost:3000` by default).

## Core Routers and Endpoints

### 1. `cases` Router
Handles the lifecycle of research cases.
- `POST /api/v1/cases`: Create a new case.
    - **Logic:** Set `owner_user_id` to current user. Default status to `draft`.
- `GET /api/v1/cases`: List user's cases.
- `GET /api/v1/cases/{case_id}`: Retrieve a specific case.
- `PATCH /api/v1/cases/{case_id}`: Update case title/description.
- `DELETE /api/v1/cases/{case_id}`: Delete a case.

### 2. `sources` Router
Handles adding context to cases (URLs, file uploads, text notes).
- `POST /api/v1/cases/{case_id}/sources`: Add a new source to a case.
    - **Logic:**
        1. Validate case ownership.
        2. Handle different types (`url`, `note`, `file`).
        3. If `file`, handle streaming upload to Supabase Storage bucket.
        4. Insert record into `sources` table with status `pending`.
        5. Enqueue an `ingestion` task for the `worker` service.
- `GET /api/v1/cases/{case_id}/sources`: List sources for a case.
- `GET /api/v1/sources/{source_id}`: Get source details and status.
- `DELETE /api/v1/sources/{source_id}`: Delete a source and associated chunks.

### 3. `runs` Router
Handles triggering the LangGraph orchestrator.
- `POST /api/v1/cases/{case_id}/runs`: Trigger a new research run.
    - **Logic:**
        1. Validate case ownership. Ensure case status is `indexed` (all sources processed).
        2. Insert record into `runs` table with status `queued`.
        3. Update case status to `analyzing`.
        4. Enqueue a `research_run` task for the `orchestrator` service.
- `GET /api/v1/cases/{case_id}/runs`: List past/current runs for a case.
- `GET /api/v1/runs/{run_id}`: Get real-time status of a run.
- `POST /api/v1/runs/{run_id}/resume`: Resume a paused run (human-in-the-loop).
    - **Logic:** When a run is in the `needs_review` state, the frontend sends approval/edits here. The API updates the `runs` table and signals the LangGraph checkpointer to resume the thread.

## Dependency Injection
- `get_current_user`: Decodes Supabase JWT, validates signature, and injects user payload into routes.
- `get_supabase`: Returns a Supabase Python client instance initialized with the `SUPABASE_SERVICE_ROLE_KEY`.

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `BACKEND_CORS_ORIGINS`
