import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class ChatResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = (
    "You are Recipe AI Chef, a friendly food assistant. When providing recipes, "
    "format your response CLEARLY with these sections:\n\n"
    "**INGREDIENTS:**\n"
    "- List each ingredient on a new line with quantity and name\n\n"
    "**PROCEDURE:**\n"
    "1. Step one\n"
    "2. Step two\n"
    "3. Step three\n"
    "(etc.)\n\n"
    "For other cooking questions, be concise and helpful. "
    "Give practical advice, substitutions, and cooking tips. "
    "Reply in the same language as the user's latest message. You support English, "
    "Tamil (தமிழ்), Malayalam (മലയാളം), Telugu (తెలుగు), and Hindi (हिन्दी). "
    "Use the matching script when the user writes in one of these languages; do not "
    "translate their question to English unless they explicitly ask. Keep recipe "
    "headings and cooking steps in that same language. "
    "Keep answers focused on food. If a question is unrelated, "
    "politely guide the user back to recipes and cooking. "
    "Never claim to diagnose medical conditions."
)


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Live AI is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.",
        )

    # Build conversation history
    conversation_text = f"{SYSTEM_PROMPT}\n\n"
    for msg in payload.messages:
        if msg.role == "user":
            conversation_text += f"User: {msg.content}\n"
        elif msg.role == "assistant":
            conversation_text += f"Assistant: {msg.content}\n"
    
    conversation_text += "Assistant:"

    # Call Gemini API
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"
    
    request_body = json.dumps({
        "contents": [
            {
                "parts": [
                    {"text": conversation_text}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 200,
        }
    }).encode("utf-8")
    
    request = Request(
        url,
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        try:
            error_data = json.loads(detail)
            provider_error = error_data.get("error", {}).get("message", detail)
        except json.JSONDecodeError:
            provider_error = detail
        raise HTTPException(status_code=502, detail=f"Live AI provider error: {provider_error}") from error
    except URLError as error:
        raise HTTPException(status_code=502, detail="Could not connect to the live AI provider.") from error

    try:
        reply = result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as error:
        raise HTTPException(status_code=502, detail="The AI provider returned an unexpected response.") from error

    return ChatResponse(reply=reply)
