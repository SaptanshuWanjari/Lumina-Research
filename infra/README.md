# Infra

Runtime assets for local containerized development live here.

## Layout

- `docker/`
  - service image definitions
  - `docker-compose.yml` for API, worker, orchestrator, website, and Redis
- `env/`
  - checked-in example environment files
- `otel/`
  - optional OpenTelemetry Collector config

## Usage

1. Copy example env files from `infra/env/` into real env files outside git or export the same variables in your shell.
2. Run:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

## Notes

- Supabase remains external. Compose only provisions app services plus Redis.
- `website` talks to `api` over the internal Docker network.
- `worker` and `orchestrator` stay on separate Celery queues.
