from __future__ import annotations

import re
from io import BytesIO
from typing import Iterable

import httpx
import tiktoken
from bs4 import BeautifulSoup
from pdfminer.high_level import extract_text

from app.core.config import settings


def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_file_text(
    content: bytes, filename: str | None, mime_type: str | None
) -> tuple[str, str, str | None]:
    name = (filename or "").lower()
    mime = (mime_type or "").lower()
    if mime == "application/pdf" or name.endswith(".pdf"):
        return normalize_text(extract_text(BytesIO(content))), "pdfminer-six", (
            mime_type or "application/pdf"
        )

    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return (
                normalize_text(content.decode(encoding)),
                f"text-{encoding}",
                mime_type or "text/plain",
            )
        except UnicodeDecodeError:
            continue
    return (
        normalize_text(content.decode("utf-8", errors="replace")),
        "text-replace",
        mime_type or "text/plain",
    )


def extract_html_text(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "template", "svg"]):
        tag.decompose()
    return normalize_text(soup.get_text("\n"))


def fetch_url_text(url: str) -> tuple[str, str, str | None]:
    with httpx.Client(
        timeout=settings.WORKER_HTTP_TIMEOUT_SECONDS, follow_redirects=True
    ) as client:
        response = client.get(url)
        response.raise_for_status()
        content_type = response.headers.get("content-type")
        content = response.content[: settings.WORKER_MAX_URL_BYTES]
    return extract_html_text(content.decode(response.encoding or "utf-8", errors="replace")), "httpx-bs4", content_type


def token_count(text: str) -> int:
    try:
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except Exception:
        return max(1, len(text.split()))


def split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
    if not paragraphs:
        return []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    def flush() -> None:
        nonlocal current, current_len
        if current:
            chunks.append("\n\n".join(current).strip())
        if chunk_overlap > 0 and chunks:
            overlap_text = _tail_words(chunks[-1], chunk_overlap)
            current = [overlap_text] if overlap_text else []
            current_len = len(overlap_text.split()) if overlap_text else 0
        else:
            current = []
            current_len = 0

    for paragraph in paragraphs:
        words = paragraph.split()
        if len(words) > chunk_size:
            flush()
            chunks.extend(_split_words(words, chunk_size, chunk_overlap))
            current = []
            current_len = 0
            continue
        if current and current_len + len(words) > chunk_size:
            flush()
        current.append(paragraph)
        current_len += len(words)

    if current:
        chunks.append("\n\n".join(current).strip())

    return [chunk for chunk in chunks if chunk]


def _tail_words(text: str, count: int) -> str:
    words = text.split()
    return " ".join(words[-count:])


def _split_words(words: list[str], chunk_size: int, chunk_overlap: int) -> Iterable[str]:
    step = max(1, chunk_size - chunk_overlap)
    for start in range(0, len(words), step):
        yield " ".join(words[start : start + chunk_size])
