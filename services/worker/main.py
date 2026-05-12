from app.core.celery_app import celery_app


def main() -> None:
    celery_app.worker_main(
        [
            "worker",
            "--loglevel=INFO",
            f"--queues={celery_app.conf.task_default_queue}",
        ]
    )


if __name__ == "__main__":
    main()
