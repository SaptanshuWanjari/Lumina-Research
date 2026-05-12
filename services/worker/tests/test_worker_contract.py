from __future__ import annotations

from app.core.celery_app import celery_app
import app.tasks.ingestion  # noqa: F401
from app.utils.embeddings import vector_literal
from app.utils.text import extract_html_text, normalize_text, split_text


def test_celery_registers_api_ingestion_task() -> None:
    assert "worker.tasks.ingestion.process_source" in celery_app.tasks


def test_text_helpers_normalize_extract_and_split() -> None:
    html = """
    <html>
      <head><style>.x{display:none}</style><script>bad()</script></head>
      <body><h1>Decision brief</h1><p>Evidence paragraph.</p></body>
    </html>
    """

    text = extract_html_text(html)
    chunks = split_text(normalize_text(text), chunk_size=3, chunk_overlap=1)

    assert "bad()" not in text
    assert "Decision brief" in text
    assert chunks
    assert all(chunk.strip() for chunk in chunks)


def test_vector_literal_uses_pgvector_shape() -> None:
    assert vector_literal([0.1, -0.2, 1.0]) == "[0.10000000,-0.20000000,1.00000000]"
