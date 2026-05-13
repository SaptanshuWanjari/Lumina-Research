# Worker Service Implementation Guide (Current)

This guide reflects the worker implementation that is currently passing the live smoke flow.

## Purpose

`services/worker` handles asynchronous ingestion only. It does not expose a web server. It consumes Celery tasks from the dedicated `worker` queue and writes indexed content back to Supabase.

## Current Structure

```
services/worker/
  main.py
  app/
    core/
      celery_app.py
      config.py
      database.py
    tasks/
      ingestion.py
    utils/
      storage.py
      text.py
      embeddings.py
```

## Ingestion Flow

Input: `source_id`

1. Load `sources` row
2. Create `ingestion_attempts` row
3. Set case status to `ingesting`
4. Fetch source content
5. Normalize text
6. Split into chunks
7. Embed with Gemini embedding model
8. Delete old `chunks` via old `documents.document_id`
9. Insert replacement `documents` row
10. Insert replacement `chunks` rows
11. Mark source `indexed`
12. Refresh parent case status

## Supported Source Types

- `file`
  - downloads from Supabase Storage
  - parses PDF via `pdfminer-six`
  - falls back to text decoding for text-like files
- `note`
  - uses `note_text`
- `url`
  - fetches HTML with `httpx`
  - strips scripts/styles and extracts visible text with BeautifulSoup

## Important Implementation Rules

- status target is `indexed`, not `processed`
- file extraction must always return `(text, parser, mime_type)`
- storage upload metadata from API is used for file parsing
- `documents.updated_at` and `ingestion_attempts.updated_at` must be set explicitly
- `chunks` must be replaced via prior document ownership, not by nonexistent `chunks.source_id`
- worker queue is `worker`; do not let it consume the default `celery` queue in mixed deployments

## Running

Redis must already be running.

```bash
cd services/worker
uv run python main.py
```

Expected queue:

- `worker`

## Manual Verification

1. Upload a file through the API
2. Watch worker logs for `worker.tasks.ingestion.process_source`
3. Poll `GET /api/v1/cases/{case_id}/sources`
4. Confirm source reaches `indexed`
5. Confirm LangSmith project `lumina-research-worker` shows `worker.process_source`

## Known Operational Dependencies

- valid `GOOGLE_API_KEY`
- Redis reachable at configured broker URL
- Supabase Storage bucket `sources`
- cloud Supabase schema with `match_chunks` RPC already applied for downstream retrieval
