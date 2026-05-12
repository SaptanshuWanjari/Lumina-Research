from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator
from urllib.parse import parse_qsl, quote, unquote, urlencode, urlsplit, urlunsplit

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
    try:
        from psycopg import Connection
        from psycopg.rows import dict_row
    except ImportError as exc:
        raise RuntimeError("psycopg is required for the Postgres checkpointer") from exc

    with Connection.connect(
        _psycopg_compatible_url(settings.LANGGRAPH_CHECKPOINT_DB_URL),
        autocommit=True,
        prepare_threshold=None,
        row_factory=dict_row,
    ) as conn:
        saver = PostgresSaver(conn)
        saver.setup()
        yield saver


def _psycopg_compatible_url(url: str) -> str:
    parsed = urlsplit(url)
    username = quote(unquote(parsed.username or ""), safe="")
    password = quote(unquote(parsed.password or ""), safe="")
    host = parsed.hostname or ""
    if ":" in host and not host.startswith("["):
        host = f"[{host}]"
    if parsed.port:
        host = f"{host}:{parsed.port}"
    netloc = f"{username}:{password}@{host}" if username else host
    query = urlencode(
        [(key, value) for key, value in parse_qsl(parsed.query) if key != "pgbouncer"]
    )
    return urlunsplit((parsed.scheme, netloc, parsed.path, query, parsed.fragment))
