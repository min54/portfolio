from pydantic import BaseModel


class AgentRequest(BaseModel):
    message: str
    context: dict[str, str] = {}


class AgentResponse(BaseModel):
    reply: str
    usage: dict[str, int] | None = None
