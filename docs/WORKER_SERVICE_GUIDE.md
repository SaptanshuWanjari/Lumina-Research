# Worker Service Implementation Guide (Async Ingestion)

This guide is an in-depth reference for the Worker layer in `services/worker`. It explains **what the layer must contain**, **file layout**, **end-to-end code flow**, **how to run it by itself**, and **how to test it with Postman-like tools**. Integration steps are at the end.

---

## 1) Purpose of This Layer

The Worker service does **heavy background processing** that cannot happen inside API requests. It parses uploaded documents, chunks text, generates embeddings, and writes vectors to the database.

---

## 2) Required Files and Structure

Expected structure inside `services/worker` (minimum viable):

```
services/worker/
  pyproject.toml
  README.md
  main.py
  app/
    __init__.py
    core/
      config.py
      database.py
    tasks/
      ingestion.py
    utils/
      storage.py
      text_splitter.py
      embeddings.py
```

### What each file should do

- `main.py`
  - Bootstraps the worker process.
  - Starts the queue consumer (Celery or Arq).

- `app/core/config.py`
  - Loads env vars (Supabase URL, service key, bucket name, queue URL).

- `app/core/database.py`
  - Initializes Supabase client.

- `app/tasks/ingestion.py`
  - Main ingestion task that processes a `source_id`.

- `app/utils/storage.py`
  - Helper to download files from Supabase Storage.

- `app/utils/text_splitter.py`
  - Helper to chunk documents consistently.

- `app/utils/embeddings.py`
  - Embedding client wrapper (OpenAI or other provider).

---

## 3) Required Code Flow

### 3.1 Ingestion Task (Core Flow)

Input: `source_id`

1. Fetch `sources` row using `source_id`.
2. Download file from Supabase Storage.
3. Parse file (PDF, TXT, DOCX).
4. Normalize text (remove duplicate whitespace, etc).
5. Chunk text into segments.
6. Generate embeddings for each chunk.
7. Insert chunks + embeddings into `chunks` table.
8. Update `sources.status = processed`.

### 3.2 Idempotency

Before writing chunks, delete old chunks for `source_id`:

```
supabase.table("chunks").delete().eq("source_id", source_id).execute()
```

### 3.3 Error Handling

- If embedding API fails, retry task.
- If parsing fails, update `sources.status = failed` and store error.

---

## 4) Running the Worker Alone

From `services/worker`:

1. Install dependencies:

```
poetry install
```

2. Run the worker:

```
poetry run python main.py
```

3. Worker listens for tasks from the queue (Redis or other broker).

---

## 5) Testing with Postman (Standalone)

The Worker does not have a web server, so you test it **indirectly** by calling the API or by pushing a task manually.

### Option A: Trigger via API

1. Upload a file with `POST /cases/{case_id}/sources`.
2. Confirm Worker receives a task from the queue.

### Option B: Manual Test Endpoint (Temporary)

You can add a temporary debugging endpoint in the API:

```
POST /debug/trigger-ingest
{
  "source_id": "..."
}
```

Then watch the Worker logs.

---

## 6) Integration Steps

### Integrate with API

- API publishes `source_id` tasks to the queue.
- Worker consumes tasks and updates Supabase tables.

### Integrate with Orchestrator

- No direct integration. Orchestrator reads from `chunks` table.

### Integrate with Website

- Website does not talk to Worker. It only checks `sources.status` via API.

---

## 7) Checklist (Worker)

- Worker boots without errors.
- Ingestion task downloads file correctly.
- Chunks inserted into `chunks` table with embeddings.
- Source row updated to `processed` or `failed`.
- Retries configured for transient errors.
