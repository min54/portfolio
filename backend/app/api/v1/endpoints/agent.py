from fastapi import APIRouter, HTTPException, status

from app.agents.assistant import run_assistant
from app.schemas.agent import AgentRequest, AgentResponse

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(payload: AgentRequest) -> AgentResponse:
    try:
        result = await run_assistant(
            message=payload.message,
            extra_context=payload.context,
        )
        return AgentResponse(reply=result.reply)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
