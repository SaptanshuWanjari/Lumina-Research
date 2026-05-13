# Orchestrator Service Implementation Guide (Current)

This guide reflects the live orchestrator implementation and the fixes required for Supabase cloud + PgBouncer.

## Purpose

`services/orchestrator` runs the stateful LangGraph workflow for research runs. It consumes only the dedicated `orchestrator` Celery queue.

## Current Graph

The current graph path is:

1. `planner`
2. `retriever`
3. `analyzer`
4. `writer`
5. `human_review`
6. `publish`

State is checkpointed by `run_id` as LangGraph `thread_id`.

## Current Runtime Behavior

- `start_run`
  - loads `runs` + `cases`
  - marks run `running`
  - invokes LangGraph
- `resume_run`
  - loads latest draft report
  - resumes from checkpoint
  - marks run `complete`

## Important Fixes Already Required

- queue isolation
  - orchestrator must consume queue `orchestrator`
  - do not consume the shared default queue in production-like runs
- Supabase PgBouncer compatibility
  - checkpointer removes `pgbouncer` query arg from connection string
  - credentials are URL-encoded before psycopg use
  - psycopg connection uses `prepare_threshold=None`
  - do not use `PostgresSaver.from_conn_string(...)` directly
- cloud model defaults
  - planner/analyzer/writer defaults use `gemini-2.5-flash`
- tracing
  - LangSmith root run: `orchestrator.start_run`
  - child traces include LangGraph and Gemini model calls

## Required Environment

- valid `SUPABASE_URL`
- valid `SUPABASE_SERVICE_ROLE_KEY`
- valid `DATABASE_URL` / `LANGGRAPH_CHECKPOINT_DB_URL`
- valid `GOOGLE_API_KEY`
- Redis broker/backend

## Running

```bash
cd services/orchestrator
uv run celery -A orchestrator.core.celery_app.celery_app worker --loglevel=INFO --queues=orchestrator
```

Expected queue:

- `orchestrator`

## Manual Verification

1. Ensure a case has at least one `indexed` source
2. Start a run through the API
3. Watch orchestrator logs for `orchestrator.tasks.runs.start_run`
4. Poll run status
5. Confirm LangSmith project `lumina-research-orchestrator`

If the run fails, first check:

- Gemini quota / model availability
- checkpoint tables in cloud Postgres
- `match_chunks` RPC exists

## Current Output Statuses

- active run states:
  - `queued`
  - `running`
  - `needs_review`
  - `resuming`
  - `complete`
  - `failed`
