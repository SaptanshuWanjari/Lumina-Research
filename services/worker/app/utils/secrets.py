from __future__ import annotations

import base64
import hashlib

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def _normalize_key_material(value: str) -> bytes:
    trimmed = value.strip()
    if len(trimmed) == 64 and all(char in "0123456789abcdefABCDEF" for char in trimmed):
        return bytes.fromhex(trimmed)

    try:
        decoded = base64.b64decode(trimmed, validate=True)
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass

    return hashlib.sha256(trimmed.encode("utf-8")).digest()


def decrypt_secret(payload: str) -> str:
    secret = settings.AI_SETTINGS_ENCRYPTION_KEY
    if not secret:
        raise RuntimeError("AI_SETTINGS_ENCRYPTION_KEY is required")

    parts = payload.split(":")
    if len(parts) != 4 or parts[0] != "v1":
        raise RuntimeError("Invalid encrypted secret format")

    _, iv_b64, encrypted_b64, tag_b64 = parts
    key = _normalize_key_material(secret)
    aesgcm = AESGCM(key)
    iv = base64.b64decode(iv_b64)
    ciphertext = base64.b64decode(encrypted_b64) + base64.b64decode(tag_b64)
    plain = aesgcm.decrypt(iv, ciphertext, None)
    return plain.decode("utf-8")
