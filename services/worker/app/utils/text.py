from __future__ import annotations

import re
from io import BytesIO
from typing import Iterable
from urllib.parse import urlparse

import httpx
import tiktoken
from bs4 import BeautifulSoup
from pdfminer.high_level import extract_text

from app.core.config import settings


class SourceFetchError(RuntimeError):
    pass


_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "text/plain;q=0.8,*/*;q=0.7"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

_BOILERPLATE_TAGS = {
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "nav",
    "footer",
    "aside",
    "form",
}


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

    for tag in soup(_BOILERPLATE_TAGS):
        tag.decompose()

    for tag in soup.find_all(
        attrs={
            "aria-hidden": "true",
        }
    ):
        tag.decompose()

    for tag in soup.find_all(True):
        text = normalize_text(tag.get_text(" ", strip=True))
        if not text:
            continue

        link_text = normalize_text(
            " ".join(link.get_text(" ", strip=True) for link in tag.find_all("a"))
        )
        text_len = len(text)
        link_ratio = (len(link_text) / text_len) if text_len else 0
        has_content_blocks = bool(tag.find(["p", "article", "section", "h1", "h2", "h3"]))

        if link_ratio > 0.7 and text_len < 500 and not has_content_blocks:
            tag.decompose()

    best_text = ""
    best_score = float("-inf")
    candidates = soup.select("article, main, [role='main'], section, div, body")

    for candidate in candidates:
        candidate_text = normalize_text(candidate.get_text("\n"))
        if len(candidate_text) < 200:
            continue

        paragraph_count = len(candidate.find_all("p"))
        heading_count = len(candidate.find_all(["h1", "h2", "h3"]))
        link_text = normalize_text(
            " ".join(link.get_text(" ", strip=True) for link in candidate.find_all("a"))
        )
        link_ratio = (len(link_text) / len(candidate_text)) if candidate_text else 0
        score = (
            len(candidate_text)
            + (paragraph_count * 120)
            + (heading_count * 80)
            - (link_ratio * 1200)
        )

        if score > best_score:
            best_score = score
            best_text = candidate_text

    if best_text:
        return best_text

    return normalize_text(soup.get_text("\n"))


def fetch_url_text(url: str) -> tuple[str, str, str | None]:
    parsed = urlparse(url)
    headers = {
        **_BROWSER_HEADERS,
        "Referer": f"{parsed.scheme}://{parsed.netloc}/" if parsed.scheme and parsed.netloc else url,
    }

    with httpx.Client(
        timeout=settings.WORKER_HTTP_TIMEOUT_SECONDS,
        follow_redirects=True,
        headers=headers,
    ) as client:
        response = client.get(url)
        if response.status_code in {401, 403, 406}:
            retry_headers = {
                **headers,
                "Accept": "*/*",
                "Upgrade-Insecure-Requests": "1",
            }
            response = client.get(url, headers=retry_headers)

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            if status_code in {401, 403, 406}:
                raise SourceFetchError(
                    f"Source site blocked automated fetch ({status_code}) for {url}. "
                    "Try uploading a file, pasting the relevant text as a note, "
                    "or use a different source URL."
                ) from exc
            raise

        content_type = response.headers.get("content-type")
        content = response.content[: settings.WORKER_MAX_URL_BYTES]

    if content_type and "html" not in content_type.lower():
        return extract_file_text(content, urlparse(url).path, content_type)

    return (
        extract_html_text(
            content.decode(response.encoding or "utf-8", errors="replace")
        ),
        "httpx-bs4",
        content_type,
    )


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
