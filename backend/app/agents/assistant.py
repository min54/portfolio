from dataclasses import dataclass

from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel

from app.core.config import settings


# --- Dependency injection context ---
@dataclass
class AssistantDeps:
    user_id: int | None = None
    extra_context: dict[str, str] | None = None


# --- Structured output model ---
class AssistantResult(BaseModel):
    reply: str
    confidence: float  # 0.0 ~ 1.0


# --- Agent definition ---
assistant_agent: Agent[AssistantDeps, AssistantResult] = Agent(
    model=OpenAIModel("gpt-4o-mini", api_key=settings.OPENAI_API_KEY),
    deps_type=AssistantDeps,
    result_type=AssistantResult,
    system_prompt=(
        "You are a helpful assistant. "
        "Always respond clearly and concisely. "
        "Set confidence based on how certain you are of your answer."
    ),
)


@assistant_agent.tool
async def get_user_context(ctx: RunContext[AssistantDeps], key: str) -> str:
    """Retrieve a value from the user's extra context by key."""
    if ctx.deps.extra_context and key in ctx.deps.extra_context:
        return ctx.deps.extra_context[key]
    return f"No context found for key: {key}"


async def run_assistant(
    message: str,
    user_id: int | None = None,
    extra_context: dict[str, str] | None = None,
) -> AssistantResult:
    deps = AssistantDeps(user_id=user_id, extra_context=extra_context or {})
    result = await assistant_agent.run(message, deps=deps)
    return result.data
