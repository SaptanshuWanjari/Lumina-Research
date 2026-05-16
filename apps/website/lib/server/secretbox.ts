import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const VERSION = "v1";

function normalizeKeyMaterial(value: string) {
  const trimmed = value.trim();

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  try {
    const base64 = Buffer.from(trimmed, "base64");
    if (base64.length === 32) return base64;
  } catch {}

  return createHash("sha256").update(trimmed, "utf8").digest();
}

function getEncryptionKey() {
  const secret = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY is required");
  }
  return normalizeKeyMaterial(secret);
}

export function encryptSecret(plainText: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    encrypted.toString("base64"),
    tag.toString("base64"),
  ].join(":");
}

export function decryptSecret(payload: string) {
  const [version, ivBase64, encryptedBase64, tagBase64] = payload.split(":");
  if (version !== VERSION || !ivBase64 || !encryptedBase64 || !tagBase64) {
    throw new Error("Invalid encrypted secret format");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivBase64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function maskSecret(secret: string) {
  if (secret.length <= 4) return secret;
  return `••••••••${secret.slice(-4)}`;
}
