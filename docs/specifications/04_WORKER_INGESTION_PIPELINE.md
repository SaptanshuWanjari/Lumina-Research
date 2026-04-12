# 04. Worker Ingestion Pipeline (`services/worker`)

## Role and Responsibilities
The `services/worker` is an asynchronous Python service that listens to a job queue (like Celery or arq) and executes heavy background tasks—primarily the ingestion and indexing of raw source materials into the `chunks` pgvector table.

## Architecture
- **Framework:** Celery, arq, or even a simple `asyncio` task queue polling the `jobs` table if keeping it Postgres-native.
- **Dependencies:** Uses the Supabase Python client (with `SUPABASE_SERVICE_ROLE_KEY`), `pydantic-settings`, OpenAI API (or other embedding model providers), and text extraction libraries like `PyMuPDF` (for PDFs) or `unstructured`.

## Core Task: `ingest_source`

**Input:** `source_id` (UUID), `owner_user_id` (UUID)

**Flow:**
1.  **Initialize:** Fetch the `source` record from Supabase. Ensure `owner_user_id` matches. Update status to `fetching`.
2.  **Retrieve Content based on `source_type`:**
    *   `url`: Use an HTTP client (like `httpx`) or a library like `playwright`/`beautifulsoup` to fetch the webpage HTML. Extract main text using `readability` or similar.
    *   `file`: The file is stored in a Supabase Storage bucket. Download the file using the Supabase client. Use `PyMuPDF` or `unstructured` to extract text from PDFs, DOCX, etc.
    *   `note`: The raw text is already in the `note_text` column.
3.  **Status Update:** Update source status to `extracting`.
4.  **Normalize and Persist:** Clean the extracted text. Hash the content to prevent duplicate processing. Save the full normalized text into the `documents` table.
5.  **Chunking:** Use LangChain's `RecursiveCharacterTextSplitter` or a similar semantic chunker.
    *   **Goal:** Break the document into meaningful segments (e.g., 500-1000 tokens) with some overlap (e.g., 100 tokens).
    *   **Status Update:** Update source status to `chunking`.
6.  **Embedding:** Iterate through the chunks and generate vector embeddings using a model like `text-embedding-3-small`.
    *   **Status Update:** Update source status to `embedding`.
    *   *Note: Batch embedding requests to the LLM provider to avoid rate limits.*
7.  **Indexing:** Insert the generated chunks, their token counts, metadata, and embeddings into the `chunks` table (which uses `pgvector`).
    *   **CRITICAL:** Ensure `owner_user_id` is set on every chunk inserted.
8.  **Completion:**
    *   Update the `source` status to `indexed`.
    *   Check if all sources for the parent `case` are now `indexed`. If so, update the `case` status from `ingesting` to `indexed`.
9.  **Error Handling:** If any step fails, catch the exception, update the `source` status to `failed`, log the `error_message`, and optionally retry (if a transient network error).

## Observability and Tracing
- The ingestion pipeline is a prime candidate for OpenTelemetry tracing.
- Dimensions to trace: `user_id`, `case_id`, `source_id`, `duration_ms` per stage (fetching, chunking, embedding).
- Keep track of `ingestion_attempts` for debugging problematic files/URLs.

## Database Interaction Rule
Even in background workers, **always enforce `owner_user_id` filtering**:
```python
supabase.table("sources").update({"status": "indexed"}).eq("id", source_id).eq("owner_user_id", user_id).execute()
```