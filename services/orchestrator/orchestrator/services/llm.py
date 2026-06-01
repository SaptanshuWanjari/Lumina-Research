from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from orchestrator.core.config import settings
from orchestrator.core.database import SupabaseRunStore, get_supabase
from orchestrator.services.secrets import decrypt_secret


@dataclass(frozen=True)
class ResolvedLlmConfig:
    provider: str
    model_name: str
    api_key: str | None = None


class GeminiService:
    def __init__(self, model_name: str, api_key: str):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError as exc:
            raise RuntimeError(
                "langchain-google-genai is required for Gemini orchestration"
            ) from exc
        self.model = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=api_key,
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


def _repair_write_todos_args(message: Any) -> Any:
    from langchain_core.messages import AIMessage

    if not isinstance(message, AIMessage) or not message.tool_calls:
        return message

    fixed = []
    changed = False
    for tc in message.tool_calls:
        if tc.get("name") == "write_todos":
            args = tc.get("args", {})
            if isinstance(args, list):
                tc = {**tc, "args": {"todos": args}}
                changed = True
            elif isinstance(args, dict) and "todos" not in args:
                values = list(args.values())
                if len(values) == 1 and isinstance(values[0], list):
                    tc = {**tc, "args": {"todos": values[0]}}
                    changed = True
        fixed.append(tc)

    if not changed:
        return message
    return message.model_copy(update={"tool_calls": fixed})


def _make_groq_subclass() -> type:
    from langchain_groq import ChatGroq

    class _ChatGroqFixed(ChatGroq):
        def _postprocess(self, result: Any) -> Any:
            from langchain_core.messages import AIMessage
            from langchain_core.outputs import ChatGeneration, ChatResult

            if isinstance(result, ChatResult):
                repaired_generations = []
                for gen in result.generations:
                    if isinstance(gen, ChatGeneration) and isinstance(
                        gen.message, AIMessage
                    ):
                        repaired_msg = _repair_write_todos_args(gen.message)
                        if repaired_msg is not gen.message:
                            gen = ChatGeneration(
                                message=repaired_msg,
                                generation_info=gen.generation_info,
                                text=gen.text,
                            )
                    repaired_generations.append(gen)
                result = ChatResult(
                    generations=repaired_generations,
                    llm_output=result.llm_output,
                )
            return result

        def _generate(self, *args: Any, **kwargs: Any) -> Any:
            return self._postprocess(super()._generate(*args, **kwargs))

        async def _agenerate(self, *args: Any, **kwargs: Any) -> Any:
            return self._postprocess(await super()._agenerate(*args, **kwargs))

    return _ChatGroqFixed


class GroqService:
    def __init__(self, model_name: str, api_key: str):
        try:
            _ChatGroqFixed = _make_groq_subclass()
        except ImportError as exc:
            raise RuntimeError("langchain-groq is required for Groq orchestration") from exc
        self.model = _ChatGroqFixed(
            model=model_name,
            api_key=api_key,
            temperature=0.2,
        )
        self._raw_model = self.model

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
            raise RuntimeError(f"Groq did not return JSON: {text[:300]}")
        return json.loads(match.group(0))



def _fallback_model(role: str, provider: str) -> str:
    if provider == "groq":
        return settings.GROQ_DEFAULT_MODEL
    if role == "planner":
        return settings.GEMINI_PLANNER_MODEL
    if role == "analyzer":
        return settings.GEMINI_ANALYZER_MODEL
    return settings.GEMINI_WRITER_MODEL


def _resolve_llm_config(owner_user_id: str, role: str) -> ResolvedLlmConfig:
    configured = SupabaseRunStore(get_supabase()).get_ai_settings(owner_user_id) or {}
    provider = str(configured.get("provider") or "gemini").strip().lower()
    if provider not in {"gemini", "groq"}:
        provider = "gemini"

    model_name = str(configured.get("model") or "").strip() or _fallback_model(
        role, provider
    )

    encrypted_api_key = str(configured.get("encrypted_api_key") or "").strip()
    api_key = decrypt_secret(encrypted_api_key) if encrypted_api_key else ""
    if not api_key:
        raise RuntimeError(
            f"{provider.title()} orchestration requires a stored API key"
        )
    return ResolvedLlmConfig(provider=provider, model_name=model_name, api_key=api_key)


def _build_llm(
    owner_user_id: str, role: str
) -> GeminiService | GroqService:
    config = _resolve_llm_config(owner_user_id, role)
    if config.provider == "groq":
        return GroqService(config.model_name, config.api_key or "")
    return GeminiService(config.model_name, config.api_key or "")


def chat_model(owner_user_id: str, role: str = "analyzer") -> Any:
    return _build_llm(owner_user_id, role).model


def planner_llm(owner_user_id: str) -> GeminiService | GroqService:
    return _build_llm(owner_user_id, "planner")


def analyzer_llm(owner_user_id: str) -> GeminiService | GroqService:
    return _build_llm(owner_user_id, "analyzer")


def writer_llm(owner_user_id: str) -> GeminiService | GroqService:
    return _build_llm(owner_user_id, "writer")
