FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_CONCURRENT_DOWNLOADS=1

WORKDIR /services/worker

RUN apt-get update && apt-get install -y --no-install-recommends inotify-tools && rm -rf /var/lib/apt/lists/*

COPY services/worker/pyproject.toml services/worker/uv.lock ./
RUN for i in 1 2 3 4 5; do \
      uv sync --frozen --no-install-project --no-dev && s=0 && break || s=$?; \
      echo "uv sync failed, retrying in 5 seconds..."; sleep 5; \
    done; exit $s

ENV PATH="/services/worker/.venv/bin:$PATH"

COPY services/worker/ ./
RUN for i in 1 2 3 4 5; do \
      uv sync --frozen --no-dev && s=0 && break || s=$?; \
      echo "uv sync failed, retrying in 5 seconds..."; sleep 5; \
    done; exit $s

CMD ["python", "main.py"]
