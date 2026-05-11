from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from orchestrator.core.config import settings


@contextmanager
def postgres_checkpointer() -> Iterator[object]:
    if not settings.LANGGRAPH_CHECKPOINT_DB_URL:
        raise RuntimeError("LANGGRAPH_CHECKPOINT_DB_URL or DATABASE_URL is required")
    try:
        from langgraph.checkpoint.postgres import PostgresSaver
    except ImportError as exc:
        raise RuntimeError(
            "langgraph-checkpoint-postgres is required for persistent graph state"
        ) from exc

    with PostgresSaver.from_conn_string(settings.LANGGRAPH_CHECKPOINT_DB_URL) as saver:
        saver.setup()
        yield saver
