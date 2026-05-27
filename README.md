# Lumina AI Research

## Website

```bash
cd apps/website
npm run dev
```

## Services

### Redis

```bash
redis-server
```

### Worker

```bash
cd services/worker
uv run python main.py
```

### Orchestrator

```bash
cd services/orchestrator
uv run celery -A orchestrator.core.celery_app.celery_app worker --loglevel=INFO --queues=orchestrator
```

### API

```bash
cd services/api
uv run python main.py
```
