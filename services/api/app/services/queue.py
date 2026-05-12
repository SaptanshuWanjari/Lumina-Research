from celery import Celery
from app.core.config import settings


celery_app = Celery(
    "lumina_api",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)


def enqueue_ingestion(source_id: str) -> None:
    celery_app.send_task(
        settings.WORKER_INGEST_TASK,
        args=[source_id],
        queue=settings.WORKER_QUEUE_NAME,
    )


def enqueue_run(run_id: str) -> None:
    celery_app.send_task(
        settings.ORCHESTRATOR_RUN_TASK,
        args=[run_id],
        queue=settings.ORCHESTRATOR_QUEUE_NAME,
    )


def enqueue_resume(run_id: str) -> None:
    celery_app.send_task(
        settings.ORCHESTRATOR_RESUME_TASK,
        args=[run_id],
        queue=settings.ORCHESTRATOR_QUEUE_NAME,
    )
