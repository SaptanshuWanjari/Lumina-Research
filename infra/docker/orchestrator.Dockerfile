FROM python:3.13-slim

ARG DEV=false

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_CONCURRENT_DOWNLOADS=1

WORKDIR /services/orchestrator

RUN if [ "$DEV" = "true" ]; then \
      apt-get update && apt-get install -y --no-install-recommends inotify-tools && \
      rm -rf /var/lib/apt/lists/*; \
    fi

COPY services/orchestrator/pyproject.toml services/orchestrator/uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    for i in 1 2 3 4 5; do \
      uv sync --frozen --no-install-project --no-dev && s=0 && break || s=$?; \
      echo "uv sync failed, retrying in 5 seconds..."; sleep 5; \
    done; exit $s

ENV PATH="/services/orchestrator/.venv/bin:$PATH"

COPY services/orchestrator/ ./
RUN --mount=type=cache,target=/root/.cache/uv \
    for i in 1 2 3 4 5; do \
      uv sync --frozen --no-dev && s=0 && break || s=$?; \
      echo "uv sync failed, retrying in 5 seconds..."; sleep 5; \
    done; \
    exit $s

EXPOSE 8080

ENV PORT=8080

CMD ["sh", "-c", "python -m http.server ${PORT:-8080} --directory /tmp & celery -A orchestrator.core.celery_app.celery_app worker --loglevel=INFO --queues=orchestrator"]
