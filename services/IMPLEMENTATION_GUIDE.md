# Backend Implementation Guide

This document reflects the current, working Python backend implementation. The stack has been validated against the cloud Supabase project, Redis-backed Celery, the worker ingestion pipeline, and the LangGraph orchestrator.

## Current Status

Implemented and verified:

- `services/api`
  - JWT-protected case, source, and run endpoints
  - Supabase Storage uploads
  - explicit queue routing for worker vs orchestrator tasks
- `services/worker`
  - Celery ingestion consumer
  - file, note, and URL source handling
  - document normalization, chunking, Gemini embeddings, chunk writes
  - ingestion attempt tracking and case/source status transitions
- `services/orchestrator`
  - Celery run/resume consumers
  - LangGraph planner/retriever/analyzer/writer/human-review/publish flow
  - Postgres checkpointing against Supabase cloud Postgres
  - LangSmith tracing for orchestration runs

Verified manually:

- source upload -> source indexed
- run creation -> run completes
- worker LangSmith traces visible
- orchestrator LangSmith traces visible

## API Notes (`services/api`)

Implemented routes:

- `POST /api/v1/cases`
- `GET /api/v1/cases`
- `GET /api/v1/cases/{case_id}`
- `PATCH /api/v1/cases/{case_id}`
- `DELETE /api/v1/cases/{case_id}`
- `POST /api/v1/cases/{case_id}/sources`
- `GET /api/v1/cases/{case_id}/sources`
- `GET /api/v1/cases/{case_id}/sources/{source_id}`
- `POST /api/v1/cases/{case_id}/runs`
- `GET /api/v1/cases/{case_id}/runs/{run_id}`
- `POST /api/v1/runs/{run_id}/approve`
- `GET /api/v1/me`
- `GET /health`

Important implementation details:

- API auth accepts Supabase JWTs and falls back to `SUPABASE_URL/auth/v1/user` using the service-role key.
- Cloud schema requires explicit `created_at` / `updated_at` values on `cases`, `sources`, and `runs` inserts; API sets them before insert.
- Source upload metadata stores `filename`, `mime_type`, and `byte_size` in `metadata_json`.
- Celery tasks are explicitly routed:
  - worker tasks -> queue `worker`
  - orchestrator tasks -> queue `orchestrator`

## Worker Notes (`services/worker`)

Current ingestion flow:

1. Load `source_id`
2. Mark case `ingesting`
3. Mark source `fetching`
4. Read content from:
   - Supabase Storage for `file`
   - `note_text` for `note`
   - HTTP fetch + HTML extraction for `url`
5. Normalize text
6. Chunk text
7. Generate Gemini embeddings (`models/gemini-embedding-001`, 1536 dimensions)
8. Replace prior `documents` / `chunks` for the source
9. Mark source `indexed`
10. Update `ingestion_attempts`
11. Recompute case status

Important fixes already applied:

- file extraction now returns `(text, parser, mime_type)` consistently
- `upsert` storage upload option must be `"true"` string for current Supabase client
- chunks are deleted via prior `document_id`, not nonexistent `source_id`
- status target is `indexed`, not `processed`
- worker runs on queue `worker`, not the default `celery` queue

## Orchestrator Notes (`services/orchestrator`)

Current graph flow:

1. `planner`
2. `retriever`
3. `analyzer`
4. `writer`
5. `human_review`
6. `publish`

Important fixes already applied:

- queue isolation: orchestrator consumes queue `orchestrator`
- checkpointer strips Supabase `pgbouncer` query param and URL-encodes credentials
- checkpointer opens psycopg with `prepare_threshold=None` to avoid PgBouncer prepared-statement failures
- Gemini chat client uses current `api_key` constructor argument
- default LLM models now use `gemini-2.5-flash-lite`
- LangSmith tracing is enabled through env propagation from settings

## Critical Rules

- Every service-role query touching owned app data must include `.eq("owner_user_id", user_id)` when ownership applies.
- Do not share the default Celery queue across worker and orchestrator consumers.
- For Supabase cloud Postgres through PgBouncer, use the custom psycopg connection path in the checkpointer; do not switch back to `PostgresSaver.from_conn_string(...)`.
