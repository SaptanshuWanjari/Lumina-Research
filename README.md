# Lumina Research

Lumina Research is a workspace for running research cases, evaluating evidence, and generating cited reports. It uses a Next.js frontend and Python-based backend services for processing.

## Architecture

- Frontend: Next.js website
- API: Python FastAPI for handling core requests
- Worker: Python worker for background tasks
- Orchestrator: Celery-based orchestrator managing task distribution
- Data: Redis and Supabase

## Local Development

### Prerequisites

- Node.js
- Python and UV
- Redis

### Getting Started

1. Frontend

   ```bash
   cd apps/website
   npm install
   npm run dev
   ```

2. Redis

   ```bash
   redis-server
   ```

3. Backend API

   ```bash
   cd services/api
   uv sync
   uv run python main.py
   ```

4. Worker

   ```bash
   cd services/worker
   uv sync
   uv run python main.py
   ```

5. Orchestrator
   ```bash
   cd services/orchestrator
   uv sync
   uv run celery -A orchestrator.core.celery_app.celery_app worker --loglevel=INFO --queues=orchestrator
   ```

### Using Docker

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

Ensure you have the necessary environment variables set up in `infra/env/` based on the provided `.example` files.
