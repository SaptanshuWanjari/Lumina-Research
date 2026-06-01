from celery import Celery
from kombu import Queue

from orchestrator.core.config import settings


celery_app = Celery(
    "orchestrator",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["orchestrator.tasks.runs"],
)
celery_app.conf.task_default_queue = settings.ORCHESTRATOR_QUEUE_NAME
celery_app.conf.task_queues = (Queue(settings.ORCHESTRATOR_QUEUE_NAME),)
celery_app.conf.task_routes = {
    "orchestrator.tasks.runs.start_run": {"queue": settings.ORCHESTRATOR_QUEUE_NAME},
    "orchestrator.tasks.runs.resume_run": {"queue": settings.ORCHESTRATOR_QUEUE_NAME},
    "orchestrator.tasks.runs.retry_run": {"queue": settings.ORCHESTRATOR_QUEUE_NAME},
}
celery_app.conf.task_max_retries = 0
celery_app.conf.task_acks_late = True
