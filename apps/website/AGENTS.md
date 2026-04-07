<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

codex resume 019d6416-2d47-7b83-8e68-002c78b94c23
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:backend-python-agent-rules -->

# Backend & Architecture Context

This is a monorepo building a single-user AI Research and Decision Workspace.
Architectural Principle: **Supabase stores state. Python computes. Next.js presents.**

## Monorepo Structure & Stack
- **`apps/website/`**: Next.js App Router (BFF & UI). Talks to Supabase directly for safe queries, and to Python APIs for AI/heavy tasks.
- **`services/api/`**: FastAPI (Python 3.13+). Internal gateway for Next.js to trigger runs/ingestion. Must validate Supabase JWTs.
- **`services/worker/`**: Python async worker for document ingestion (extract, chunk, embed into pgvector).
- **`services/orchestrator/`**: Python LangGraph service for stateful AI workflows (research, critique, human-in-the-loop).
- **`supabase/`**: Source of truth. Uses Postgres + pgvector.

## Python Coding Guidelines
- Use **Python 3.13+** and standard modern typing (`typing` module, `Pydantic` v2).
- Dependency management is done via `pyproject.toml` (uv/pip).
- **Authorization**: Every database row is owned by a single user (`owner_user_id`). Python services must enforce this ownership on all queries, either by passing the validated user JWT to the Supabase client or strictly filtering by `owner_user_id` when using the Service Role Key.
- **LangGraph**: Workflows must be stateful and checkpointed to Postgres to support pausing/resuming for human review.

<!-- END:backend-python-agent-rules -->
