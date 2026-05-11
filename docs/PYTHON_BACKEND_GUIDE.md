# Comprehensive Python Backend Implementation Guide

Welcome to the Python backend of the AI Research and Decision Workspace! Since this is your first large-scale, multi-language project, navigating multiple microservices can feel overwhelming. This guide is designed to break down the **API**, **Worker**, and **Orchestrator** services.

It explains _why_ we separate them, _what_ each one does, and _how_ to implement them effectively.

---

## 🏗️ The Big Picture: Why Three Services?

In a monolithic application, you might shove all your code into a single backend server. In large-scale AI applications, this breaks down quickly:

- **Web requests** need to be blazing fast (handling user clicks).
- **Document processing** takes minutes and requires heavy CPU (parsing PDFs, embedding text).
- **AI reasoning (LangGraph)** is complex, requires constant pausing (wait for human review), and maintains long-running state.

To solve this, we split the Python backend into three specialized layers:

1. **API Service (**`services/api`**)**: The "Front Door". It talks to Next.js, validates user requests, and reads/writes simple data.
2. **Worker Service (**`services/worker`**)**: The "Heavy Lifter". It silently processes documents in the background.
3. **Orchestrator Service (**`services/orchestrator`**)**: The "Brain". It manages multi-step AI agents and keeps track of their reasoning steps.

---

## Layer 1: The API Service (FastAPI)

FastAPI is our primary gateway. It receives REST HTTP requests from the Next.js frontend.

### Primary Responsibilities

- Validate incoming requests (Data validation using Pydantic).
- Verify user authentication and authorization (via Supabase).
- Perform basic CRUD operations (Create, Read, Update, Delete) on the database.
- Trigger background jobs (Worker) or AI workflows (Orchestrator).

### Implementation Details

- **Framework:** FastAPI
- **Directory:** `services/api/app/`
- **Key Patterns:**
  - **Dependency Injection:** Use FastAPI's `Depends()` to inject the authenticated Supabase client into your routes. This ensures endpoints are secure.
  - **Async I/O:** Always use `async def` for route handlers to ensure the API can handle thousands of concurrent frontend requests without blocking.

### Example Flow (File Upload):

1. User uploads a PDF to `/cases/{case_id}/sources` on the API.
2. API validates the user owns `case_id` (using Supabase).
3. API uploads the raw file to Supabase Storage.
4. API creates a database row for the source (status: `pending`).
5. **Crucial Step:** The API _does not_ process the PDF. It simply sends a message to the Worker (e.g., via Redis/Celery) saying "Process source_id 123" and immediately returns a `202 Accepted` to the frontend.

---

## Layer 2: The Worker Service (Async Queue)

The Worker is a headless service (no web server). It listens to a message broker (like Redis or RabbitMQ) for background tasks.

### Primary Responsibilities

- **Data Ingestion:** Parsing massive PDFs, Word docs, etc.
- **Chunking & Embeddings:** Splitting text into chunks (e.g., LangChain's `RecursiveCharacterTextSplitter`) and calling OpenAI/provider APIs to generate vector embeddings.
- **Database Updates:** Writing vectors to Postgres (pgvector) and updating the file's status to `completed`.

### Implementation Details

- **Framework:** Celery (or Arq for modern asyncio).
- **Directory:** `services/worker/main.py`
- **Key Patterns:**
  - **Idempotency:** A fancy word meaning "if a task runs twice by accident, it shouldn't duplicate data." Always delete existing chunks for a `source_id` before generating new ones.
  - **Fault Tolerance:** API calls to OpenAI might fail. Configure your tasks to automatically retry on failure using Celery's `@task(bind=True, max_retries=3)` pattern.

### How it Communicates:

The Worker rarely talks _back_ to the API directly. Instead, when it finishes chunking a document, it updates the `status` column in the Supabase `sources` table. The Next.js frontend (or API) reads this updated status.

---

## Layer 3: The Orchestrator Service (LangGraph)

This is the most advanced layer. Traditional code executes top-to-bottom. AI workflows often loop, pause, and require branching logic (e.g., Agent makes a plan -> Agent searches internet -> Agent reviews findings -> Go back to search if findings are bad).

### Primary Responsibilities

- Managing multi-agent research operations.
- Storing the "State" of the AI's thought process.
- Executing RAG (Retrieval-Augmented Generation) queries against the database.
- Pausing execution to ask for human-approval, then resuming.

### Implementation Details

- **Framework:** LangGraph + Postgres Checkpointer + LangChain.
- **Directory:** `services/orchestrator/main.py`
- **Key Patterns:**
  - **TypedDict State:** The entire memory of the AI resides in a `State` dictionary that gets passed from node to node.
  - **Postgres Checkpointing:** We use `langgraph-checkpoint-postgres` so that after every step, the AI's exact memory is saved to the database. If the server crashes, it picks up exactly where it left off.
  - **Human-in-the-loop:** The graph will have a "Wait" node. The graph saves state and sleeps. The Next.js frontend calls an API to say "approved", which sends a message to the Orchestrator to wake up and resume that specific `thread_id`.

---

## Crucial Cross-Cutting Rules for Large Projects

Working across multiple languages (TypeScript Frontend, Python Backend) requires strict discipline:

### 1. Security (Row Level Security - RLS)

When writing queries inside Python, you are often using a Supabase Service Key, which **bypasses normal database security rules**.

- **RULE:** You must _always_ explicitly filter by the user's ID in Python queries.
- **DO NOT:** `supabase.table('cases').select('*').eq('id', case_id)` (This is a catastrophic data leak!)
- **DO:** `supabase.table('cases').select('*').eq('id', case_id).eq('owner_user_id', user_id)`

### 2. Single Source of Truth for Data

TypeScript and Python need to agree on what a "Case" or a "Report" looks like.

- Try to match your Pydantic schemas (Python) as closely as possible to your Prisma/Supabase definitions (TypeScript). Keep them synced.

### 3. Environment Variables

Never hardcode API keys or database URLs. Both Next.js and Python need their own access to environment variables (`.env` files).

### 4. Logging and Observability

Because a single user action (generate report) jumps from Next.js -> FastAPI -> Celery Worker -> LangGraph Orchestrator, debugging is hard. Use structured logs and pass a `trace_id` through all services (via OpenTelemetry) so you can track a request across the entire system.

## Recommended Order of Development

1. **API Service:** Build this first. Get it talking securely to Supabase and Next.js.
2. **Worker Service:** Build second. Test it by uploading a PDF via the API and watching the Worker process it into database vectors.
3. **Orchestrator:** Build last. Treat it as a completely distinct system that just happens to read the vectors generated by the Worker.
