# 01. Architecture and Core Principles

## System Overview

The "Lumina Research" application is a single-user AI Research and Decision Workspace. The fundamental architectural rule is: **Supabase stores state. Python computes. Next.js presents.**

The platform consists of four main components:

1. **Next.js App Router (**`apps/website`**)**: Handles user authentication, User Interface (UI), and serves as the Backend-for-Frontend (BFF).
2. **Supabase Platform**: Provides PostgreSQL for relational state, `pgvector` for semantic search, Supabase Auth for identity management, and Storage for file uploads.
3. **FastAPI Gateway & Workers (**`services/api`**, **`services/worker`**)**: Python services responsible for secure API access, background document ingestion, chunking, and vector embedding.
4. **LangGraph Orchestrator (**`services/orchestrator`**)**: Stateful Python workflows that manage the multi-agent reasoning loops, retrieval, report drafting, and human-in-the-loop checkpoints.

## Core Architectural Rules

- **Single-User Tenancy:** This is a personal workspace application. Multi-tenant concepts (workspaces, RBAC, invites) are strictly out of scope.
- **Absolute Data Ownership:** Every single application row in the database MUST be owned by a single authenticated user via the `owner_user_id` column.
- **Security Perimeter:**
  - The Next.js browser client ONLY communicates with Next.js BFF API endpoints or directly to Supabase via Row Level Security (RLS).
  - Next.js BFF communicates with the Python FastAPI Gateway.
  - Python services (Worker, Orchestrator) use Supabase Service Role keys to interact with the database, but they are internally required to append `.eq('owner_user_id', user_id)` to _every_ query.
- **Stateful Workflows:** Long-running LLM processes must utilize LangGraph's persistent checkpointing (via `langgraph-checkpoint-postgres`) to allow pausing, human review, and resuming without losing state.

## End-to-End Case Lifecycle

A Research Case moves through the following strict states:

1. **Draft:** Case created, waiting for sources.
2. **Ingesting:** Python worker is fetching, parsing, and chunking sources.
3. **Indexed:** All sources are embedded into pgvector. Case is ready for analysis.
4. **Analyzing:** LangGraph orchestrator is running the research plan, retrieving data, and drafting a report.
5. **Review:** LangGraph hits the `await_human_review` node and pauses. The frontend alerts the user to review the draft report.
6. **Published:** User approves the draft. LangGraph resumes, finalizes citations, and saves the final report version.
