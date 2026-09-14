import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/ingredients-chat", tags=["ingredients-chat"])


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


class ChatResponse(BaseModel):
    reply: str


INGREDIENTS_SYSTEM_PROMPT = (
    "You are Recipe AI Chef specialized in finding recipes by ingredients. "
    "When users tell you what ingredients they have, suggest delicious recipes they can make. "
    "Format your response with:\n\n"
    "**RECIPE NAME:**\n"
    "Brief description\n\n"
    "**INGREDIENTS YOU HAVE:**\n"
    "- List the ingredients from what they told you\n\n"
    "**WHAT YOU NEED:**\n"
    "- List any additional common ingredients (if any)\n\n"
    "**QUICK STEPS:**\n"
    "1. Step one\n"
    "2. Step two\n"
    "(etc.)\n\n"
    "Be creative and suggest recipes that use most of their available ingredients. "
    "Keep suggestions practical and quick to prepare. "
    "Reply in the same language as the user's latest message. You support English, "
    "Tamil (தமிழ்), Malayalam (മലയാളം), Telugu (తెలుగు), and Hindi (हिन्दी). "
    "Use the matching script when the user writes in one of these languages, and keep "
    "the recipe name, headings, ingredients, and steps in that same language. "
    "Never claim to diagnose medical conditions."
)


@router.post("", response_model=ChatResponse)
def ingredients_chat(payload: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Live AI is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.",
        )

    # Build conversation history
    conversation_text = f"{INGREDIENTS_SYSTEM_PROMPT}\n\n"
    for msg in payload.messages:
        if msg.role == "user":
            conversation_text += f"User: {msg.content}\n"
        elif msg.role == "assistant":
            conversation_text += f"Assistant: {msg.content}\n"
    
    conversation_text += "Assistant:"

    # Call Gemini API
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
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
            "temperature": 0.5,
            "maxOutputTokens": 250,
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
