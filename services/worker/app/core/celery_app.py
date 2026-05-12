from __future__ import annotations

from celery import Celery
from kombu import Queue

from app.core.config import settings


celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.ingestion"],
)
celery_app.conf.task_default_queue = settings.WORKER_QUEUE_NAME
celery_app.conf.task_queues = (Queue(settings.WORKER_QUEUE_NAME),)
celery_app.conf.task_routes = {
    "worker.tasks.ingestion.process_source": {"queue": settings.WORKER_QUEUE_NAME}
}
