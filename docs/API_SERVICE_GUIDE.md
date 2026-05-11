# **API Service Implementation Guide (FastAPI)**

This guide is a full, in-depth reference for building the API layer in `services/api`. It covers **what the layer must contain**, **file layout**, **code flow**, **how to run it by itself**, and **how to test it with Postman-like tools**. Integration steps with Worker, Orchestrator, and the website are included at the end.

---

## 1) Purpose of This Layer

The API service is the **front door** to the backend. It must be fast, secure, and predictable. It validates requests, enforces ownership rules, stores and retrieves data, and triggers background work. It should **never** do heavy processing itself.

---

## 2) Required Files and Structure

Expected structure inside `services/api` (minimum viable):

```
services/api/
  pyproject.toml
  README.md
  main.py
  app/
    __init__.py
    main.py
    core/
      config.py
      security.py
      database.py
    api/
      deps.py
      endpoints/
        cases.py
        sources.py
        runs.py
        health.py
    models/
      cases.py
      sources.py
      runs.py
    schemas/
      cases.py
      sources.py
      runs.py
```

### What each file should do

- `main.py` (root)
  - Entrypoint. Should call `uvicorn app.main:app` or expose it.
- `app/main.py`
  - Creates the FastAPI app, includes routers, sets middleware.
- `app/core/config.py`
  - Loads environment variables (Supabase URL, keys, bucket names, queue URLs).
- `app/core/security.py`
  - Verifies JWT tokens from frontend requests.
  - Extracts `user_id` and `email`.
- `app/core/database.py`
  - Initializes the Supabase client.
  - Keeps a singleton for reuse.
- `app/api/deps.py`
  - Dependency injection helpers: get Supabase client, get current user.
- `app/api/endpoints/*.py`
  - Actual API routes.
  - Each file groups a domain (cases, sources, runs, health).
- `app/models/*.py`
  - Internal data models (if needed).
- `app/schemas/*.py`
  - Pydantic request and response models.

---

## 3) Core Endpoint Set

These are the minimum endpoints the API service must expose:

### Cases

- `GET /cases`
- `POST /cases`
- `GET /cases/{case_id}`

### Sources (Uploads)

- `POST /cases/{case_id}/sources`
  - Accepts `UploadFile`.
  - Stores to Supabase Storage.
  - Inserts row in `sources` table.
  - Enqueues ingestion task.

### Runs

- `POST /cases/{case_id}/runs`
  - Inserts a `run` row with `status = queued`.
  - Enqueues orchestration task.
- `GET /cases/{case_id}/runs/{run_id}`
  - Returns run status.
- `POST /runs/{run_id}/approve`
  - Marks run as `resuming` and enqueues resume task.

### Health

- `GET /health`
  - Returns `{ "status": "ok" }`.

---

## 4) Required Code Flow

### 4.1 Authentication Flow

1. Frontend sends `Authorization: Bearer <jwt>`.
2. `security.py` verifies the token.
3. `deps.py` extracts `user_id` and injects into route handlers.

### 4.2 Ownership Enforcement (Critical)

Every DB query must include `.eq("owner_user_id", user_id)`.

Example:

```
supabase.table("cases").select("*").eq("id", case_id).eq("owner_user_id", user_id).execute()
```

### 4.3 File Upload Flow

1. API receives `UploadFile`.
2. API validates `case_id` belongs to user.
3. API uploads file to Supabase Storage bucket `sources`.
4. API inserts `sources` row with `status = pending`.
5. API enqueues ingestion task to Worker.

### 4.4 Run Trigger Flow

1. API receives run request.
2. Validate `case_id` ownership.
3. Insert row in `runs` table.
4. Enqueue orchestrator job with `run_id`.

### 4.5 Run Approval Flow

1. API receives approval request.
2. Validate run ownership.
3. Update run status to `resuming`, set `approved_by_user_id` and `approved_at`.
4. Enqueue orchestrator resume task.

---

## 5) Running the API Service Alone

From `services/api`:

1. Install dependencies:

```
poetry install
```

1. Run the server:

```
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

1. API will be available at:

```
http://localhost:8000
```

---

## 6) Testing with Postman (Standalone)

### Test 1: Health

- Method: `GET`
- URL: `http://localhost:8000/health`

### Test 2: Create Case

- Method: `POST`
- URL: `http://localhost:8000/cases`
- Headers: `Authorization: Bearer <jwt>`
- Body (JSON):

```
{
  "title": "Test Case",
  "description": "A test case from Postman"
}
```

### Test 3: Upload Source

- Method: `POST`
- URL: `http://localhost:8000/cases/<case_id>/sources`
- Headers: `Authorization: Bearer <jwt>`
- Body: Form-data
  - Key: `file`
  - Value: (select file)

### Test 4: Start Run

- Method: `POST`
- URL: `http://localhost:8000/cases/<case_id>/runs`
- Headers: `Authorization: Bearer <jwt>`

### Test 5: Approve Run

- Method: `POST`
- URL: `http://localhost:8000/runs/<run_id>/approve`
- Headers: `Authorization: Bearer <jwt>`

---

## 7) Integration Steps

### Integrate with Worker

- When `sources` insert happens, enqueue a Worker job with `source_id`.
- Confirm Worker updates `sources.status` to `processed`.

### Integrate with Orchestrator

- When `runs` insert happens, enqueue an Orchestrator job with `run_id`.
- API should expose `GET /cases/{case_id}/runs/{run_id}` to poll status.
- API should expose `POST /runs/{run_id}/approve` to resume a paused run.

### Integrate with Website (Next.js)

- Frontend calls the API, not Worker or Orchestrator directly.
- All auth is passed in the `Authorization` header.
- UI poll endpoints for status updates.

---

## 8) Common Failure Modes

- Missing `.eq("owner_user_id", user_id)` on queries.
- File upload fails because bucket name is wrong.
- API blocks for heavy work (should never parse files).
- Invalid JWT causing 401 errors (check token source).

---

## 9) Checklist (API)

- FastAPI app runs locally.
- Auth dependency extracts user correctly.
- All queries enforce ownership.
- Upload endpoint stores file and creates `sources` row.
- Run endpoint creates `runs` row and triggers orchestrator.
- Health endpoint returns OK.
