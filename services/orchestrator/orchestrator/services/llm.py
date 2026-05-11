from __future__ import annotations

import json
import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from orchestrator.core.config import settings


class GeminiService:
    def __init__(self, model_name: str):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError as exc:
            raise RuntimeError(
                "langchain-google-genai is required for Gemini orchestration"
            ) from exc
        if not settings.GOOGLE_API_KEY:
            raise RuntimeError("GOOGLE_API_KEY is required for Gemini orchestration")
        self.model = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
        )

    def invoke_text(self, system: str, user: str) -> str:
        response = self.model.invoke(
            [SystemMessage(content=system), HumanMessage(content=user)]
        )
        content = getattr(response, "content", "")
        return content if isinstance(content, str) else json.dumps(content)

    def invoke_json(self, system: str, user: str) -> dict[str, Any]:
        text = self.invoke_text(system, user)
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise RuntimeError(f"Gemini did not return JSON: {text[:300]}")
        return json.loads(match.group(0))


def planner_llm() -> GeminiService:
    return GeminiService(settings.GEMINI_PLANNER_MODEL)


def analyzer_llm() -> GeminiService:
    return GeminiService(settings.GEMINI_ANALYZER_MODEL)


def writer_llm() -> GeminiService:
    return GeminiService(settings.GEMINI_WRITER_MODEL)
