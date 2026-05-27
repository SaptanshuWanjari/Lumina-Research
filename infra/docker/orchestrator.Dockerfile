FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /services/orchestrator

RUN pip install --upgrade pip

COPY services/orchestrator/ ./
RUN pip install .

CMD ["celery", "-A", "orchestrator.core.celery_app.celery_app", "worker", "--loglevel=INFO", "--queues=orchestrator"]
