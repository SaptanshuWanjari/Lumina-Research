# API Service Implementation Guide (Current)

This guide reflects the API implementation that is currently working with the smoke script and cloud Supabase.

## Purpose

`services/api` is the synchronous gateway for the app. It validates user auth, enforces ownership, writes intent rows, uploads files, and enqueues background tasks. It does not perform heavy ingestion or orchestration work directly.

## Current Endpoints

- `GET /health`
- `GET /api/v1/me`
- `GET /api/v1/cases`
- `POST /api/v1/cases`
- `GET /api/v1/cases/{case_id}`
- `PATCH /api/v1/cases/{case_id}`
- `DELETE /api/v1/cases/{case_id}`
- `GET /api/v1/cases/{case_id}/sources`
- `GET /api/v1/cases/{case_id}/sources/{source_id}`
- `POST /api/v1/cases/{case_id}/sources`
- `GET /api/v1/cases/{case_id}/runs`
- `GET /api/v1/cases/{case_id}/runs/{run_id}`
- `POST /api/v1/cases/{case_id}/runs`
- `POST /api/v1/runs/{run_id}/approve`

## Authentication

Current auth behavior:

- first attempts HS256 decode with `SUPABASE_JWT_SECRET`
- if that fails, falls back to `SUPABASE_URL/auth/v1/user` using the service-role key

This fallback matters for real cloud Supabase tokens and was validated during manual smoke testing.

## Current Write Requirements

Cloud schema compatibility requires the API to set timestamps explicitly on inserts where `updated_at` is non-nullable.

Current inserts now set:

- `cases`
  - `created_at`
  - `updated_at`
- `sources`
  - `created_at`
  - `updated_at`
- `runs`
  - `created_at`
  - `updated_at`
  - `started_at`
  - `triggered_by_user_id`

## Current Queueing Contract

The API must route tasks explicitly.

- ingestion task `worker.tasks.ingestion.process_source` -> queue `worker`
- orchestrator task `orchestrator.tasks.runs.start_run` -> queue `orchestrator`
- orchestrator resume task `orchestrator.tasks.runs.resume_run` -> queue `orchestrator`

Do not rely on the default Celery queue in multi-consumer setups.

## Source Upload Notes

- files are uploaded to Supabase Storage bucket `sources`
- storage upload option `upsert` must be string `"true"` for the installed client
- metadata persisted on source row:
  - `filename`
  - `mime_type`
  - `byte_size`

## Running

```bash
cd services/api
uv run python main.py
```

## Manual Validation

The validated smoke path is:

1. fetch Supabase access token
2. `GET /api/v1/me`
3. `POST /api/v1/cases`
4. `POST /api/v1/cases/{case_id}/sources`
5. wait for source `indexed`
6. `POST /api/v1/cases/{case_id}/runs`
7. wait for run `complete`

## Common Failure Modes

- wrong Supabase anon key / token source for the active cloud project
- API process not restarted after `.env` or code change
- wrong queue routing causing worker/orchestrator task collisions
- missing explicit timestamps on inserts against the cloud schema
- invalid storage upload option types for current Supabase client
