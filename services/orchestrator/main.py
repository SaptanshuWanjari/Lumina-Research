from orchestrator.core.celery_app import celery_app
import orchestrator.tasks.runs  # noqa: F401 - registers Celery tasks


def main():
    registered = sorted(
        name for name in celery_app.tasks if name.startswith("orchestrator.")
    )
    print("Orchestrator Celery app ready")
    for task_name in registered:
        print(task_name)


if __name__ == "__main__":
    main()
