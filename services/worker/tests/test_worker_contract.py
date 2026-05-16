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


def test_extract_html_text_removes_common_page_chrome() -> None:
    html = """
    <html>
      <body>
        <header>Site Header</header>
        <nav>Previous article Next article</nav>
        <aside class="popular-topics sponsored sidebar">
          Sponsored by
          Popular Topics
          sysadmins, server, performance, commands
        </aside>
        <main>
          <article>
            <h1>Linux Shell Comparison</h1>
            <p>Bash is common in most Linux distributions.</p>
            <p>Zsh is highly customizable and popular with advanced users.</p>
            <p>Fish focuses on usability and interactive features.</p>
            <p>Ksh remains relevant in some enterprise environments.</p>
            <p>Tcsh continues the C shell family with modern conveniences.</p>
          </article>
        </main>
        <footer>Popular Articles and newsletter signup</footer>
      </body>
    </html>
    """

    text = extract_html_text(html)

    assert "Linux Shell Comparison" in text
    assert "Bash is common" in text
    assert "Sponsored by" not in text
    assert "Popular Topics" not in text
    assert "Previous article" not in text
    assert "newsletter signup" not in text


def test_vector_literal_uses_pgvector_shape() -> None:
    assert vector_literal([0.1, -0.2, 1.0]) == "[0.10000000,-0.20000000,1.00000000]"
