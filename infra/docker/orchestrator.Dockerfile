FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /services/orchestrator

RUN pip install --upgrade pip uv

COPY services/orchestrator/pyproject.toml services/orchestrator/uv.lock ./
RUN uv export --frozen --no-dev --format requirements-txt > requirements.txt \
    && pip install -r requirements.txt

COPY services/orchestrator/ ./

CMD ["celery", "-A", "orchestrator.core.celery_app.celery_app", "worker", "--loglevel=INFO", "--queues=orchestrator"]
