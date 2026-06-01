from __future__ import annotations


class NonRetryableError(RuntimeError):
    """Raised when the AI provider returns an error that retry cannot fix.

    Examples:
    - 429 quota/rate-limit that will not clear within a run's lifetime
    - 401 / 403 invalid or revoked API key
    - 402 payment required / billing disabled
    """


_QUOTA_PHRASES = frozenset(
    [
        "quota",
        "resource_exhausted",
        "insufficient_quota",
        "rate limit",
        "rate_limit",
        "ratelimit",
        "too many requests",
        "requests per day",
        "free tier",
        "billing",
        "out of credits",
    ]
)

_AUTH_PHRASES = frozenset(
    [
        "invalid api key",
        "invalid_api_key",
        "api key",
        "apikey",
        "unauthorized",
        "forbidden",
        "authentication",
    ]
)


def classify_llm_error(exc: BaseException) -> NonRetryableError | None:
    """Return a *NonRetryableError* if *exc* is an unrecoverable provider error.

    Returns *None* for errors that are worth retrying (network blips, 5xx, etc.).
    """
    msg = str(exc).lower()
    status = _http_status(exc)

    # --- Quota / rate-limit (429 or matching text) ---
    if status == 429 or any(p in msg for p in _QUOTA_PHRASES):
        return NonRetryableError(
            "Your AI provider account has run out of quota or credits. "
            "Please check your billing dashboard and top up before retrying."
        )

    # --- Auth / key problems (401 / 403 or matching text) ---
    if status in (401, 402, 403) or any(p in msg for p in _AUTH_PHRASES):
        return NonRetryableError(
            "The stored API key was rejected by the provider (invalid, revoked, or "
            "billing disabled). Please update your AI settings with a valid key."
        )

    return None


def _http_status(exc: BaseException) -> int | None:
    """Extract HTTP status code from common provider SDK exception classes."""
    # google-generativeai / google-genai ClientError
    for attr in ("code", "status_code", "http_status"):
        val = getattr(exc, attr, None)
        if isinstance(val, int):
            return val

    # Some SDKs embed it in .response.status_code
    resp = getattr(exc, "response", None)
    if resp is not None:
        val = getattr(resp, "status_code", None)
        if isinstance(val, int):
            return val

    # Try to parse from the string representation
    import re
    m = re.search(r"\b(4\d{2}|5\d{2})\b", str(exc)[:200])
    if m:
        return int(m.group(1))

    return None
