from celery import Celery

from orchestrator.core.config import settings


celery_app = Celery(
    "orchestrator",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["orchestrator.tasks.runs"],
)
