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


def _repair_groq_tool_args(message: Any) -> Any:
    """Fix two classes of Groq/Llama tool-call formatting bugs.

    **Bug 1 – bare-array args for write_todos**:
    Groq's Llama models sometimes call ``write_todos`` with a bare JSON array
    as arguments instead of the expected ``{"todos": [...]}``.  We wrap it.

    **Bug 2 – JSON embedded in the tool name**:
    The model occasionally generates a call like
    ``grep {"pattern": "...", "glob": "**/*.js"}`` where the entire JSON is
    concatenated into the function name string.  Groq rejects this server-side
    because the synthesized name doesn't match any declared tool.  We strip
    these malformed calls so the message is still valid, and the model will
    self-correct on the next turn.
    """
    from langchain_core.messages import AIMessage

    if not isinstance(message, AIMessage) or not message.tool_calls:
        return message

    fixed = []
    changed = False
    for tc in message.tool_calls:
        name = tc.get("name", "")

        # --- Bug 2: name contains embedded JSON (name includes '{') ---
        # e.g. name = 'grep {"pattern": "...", "glob": "**/*.js"}'
        if "{" in name:
            # Drop the call entirely — it references a hallucinated tool
            changed = True
            continue

        # --- Bug 1: write_todos receives a bare array instead of {todos:[]} ---
        if name == "write_todos":
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


def _make_tool_error_result(error_msg: str) -> Any:
    """Build a synthetic ChatResult that reports a tool error back to the model.

    Used when Groq returns a 400 ``tool_use_failed`` response.  By returning a
    valid ChatResult containing the error as assistant text (no tool calls), the
    LangGraph agent loop can continue and the model can self-correct.
    """
    from langchain_core.messages import AIMessage
    from langchain_core.outputs import ChatGeneration, ChatResult

    content = (
        "[TOOL_ERROR] " + error_msg +
        " — please use only the tools that were explicitly listed in your "
        "available tools and call them with the correct argument format."
    )
    return ChatResult(
        generations=[
            ChatGeneration(
                message=AIMessage(content=content),
                text=content,
            )
        ]
    )


def _make_groq_subclass() -> type:
    """Dynamically build a ChatGroq subclass that repairs Groq tool-call bugs.

    We build the class lazily so that importing this module doesn't fail if
    ``langchain_groq`` is not installed.  The returned class is a genuine
    ``BaseChatModel`` subclass, so ``deepagents.resolve_model``'s
    ``isinstance(model, BaseChatModel)`` check passes without any tricks.
    """
    from langchain_groq import ChatGroq

    class _ChatGroqFixed(ChatGroq):
        """ChatGroq that repairs Groq/Llama tool-call formatting bugs."""

        def _postprocess(self, result: Any) -> Any:
            """Repair write_todos bare-array args and drop JSON-in-name tool calls."""
            from langchain_core.messages import AIMessage
            from langchain_core.outputs import ChatGeneration, ChatResult

            if isinstance(result, ChatResult):
                repaired_generations = []
                for gen in result.generations:
                    if isinstance(gen, ChatGeneration) and isinstance(
                        gen.message, AIMessage
                    ):
                        repaired_msg = _repair_groq_tool_args(gen.message)
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

        @staticmethod
        def _is_tool_validation_error(exc: BaseException) -> bool:
            """Return True if exc is a Groq 400 tool-call validation failure."""
            try:
                import groq

                if not isinstance(exc, groq.BadRequestError):
                    return False
            except ImportError:
                pass
            msg = str(exc)
            return "tool_use_failed" in msg or "tool call validation failed" in msg

        @staticmethod
        def _extract_tool_error_detail(exc: BaseException) -> str:
            """Extract a concise description from the Groq error body."""
            msg = str(exc)
            return msg[:400] if len(msg) > 400 else msg

        def _generate(self, *args: Any, **kwargs: Any) -> Any:
            try:
                return self._postprocess(super()._generate(*args, **kwargs))
            except Exception as exc:
                if self._is_tool_validation_error(exc):
                    return _make_tool_error_result(self._extract_tool_error_detail(exc))
                raise

        async def _agenerate(self, *args: Any, **kwargs: Any) -> Any:
            try:
                return self._postprocess(await super()._agenerate(*args, **kwargs))
            except Exception as exc:
                if self._is_tool_validation_error(exc):
                    return _make_tool_error_result(self._extract_tool_error_detail(exc))
                raise

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
