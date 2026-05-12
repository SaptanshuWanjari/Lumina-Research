from __future__ import annotations

from typing import Any

from app.core.config import settings


class GeminiEmbedder:
    def __init__(self) -> None:
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError("GOOGLE_API_KEY is required for Gemini embeddings")
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
        except ImportError as exc:
            raise RuntimeError(
                "langchain-google-genai is required for Gemini embeddings"
            ) from exc

        kwargs: dict[str, Any] = {
            "model": settings.GEMINI_EMBEDDING_MODEL,
            "api_key": settings.GOOGLE_API_KEY,
        }
        try:
            self.client = GoogleGenerativeAIEmbeddings(
                **kwargs, output_dimensionality=settings.GEMINI_EMBEDDING_DIMENSIONS
            )
        except TypeError:
            self.client = GoogleGenerativeAIEmbeddings(**kwargs)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        vectors = self.client.embed_documents(texts)
        for vector in vectors:
            if len(vector) != settings.GEMINI_EMBEDDING_DIMENSIONS:
                raise RuntimeError(
                    "Embedding dimension mismatch: "
                    f"got {len(vector)}, expected {settings.GEMINI_EMBEDDING_DIMENSIONS}"
                )
        return vectors


def vector_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in vector) + "]"
