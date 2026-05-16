import os
import httpx
import json
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import AIInsightRequest, AIReportRequest
from app.utils.auth import get_current_user

router = APIRouter()

GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_MODEL     = "llama3-8b-8192"
GEMINI_MODEL   = "gemini-1.5-flash"


async def call_groq(system: str, user: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user",   "content": user},
                ],
                "temperature": 0.7,
                "max_tokens": 800,
            }
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def call_gemini(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


async def generate_text(system_prompt: str, user_prompt: str) -> str:
    """Try Groq first, fall back to Gemini."""
    if GROQ_API_KEY:
        return await call_groq(system_prompt, user_prompt)
    elif GEMINI_API_KEY:
        return await call_gemini(f"{system_prompt}\n\n{user_prompt}")
    else:
        raise HTTPException(status_code=503, detail="No AI API key configured (GROQ_API_KEY or GEMINI_API_KEY)")


INSIGHT_SYSTEM = """You are InsightX's AI analytics engine for a contributor management platform.
Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "headline": "short punchy title (max 8 words)",
  "summary": "2-3 sentence professional business insight",
  "recommendation": "one actionable recommendation sentence",
  "severity": "positive|warning|info|critical"
}"""

REPORT_SYSTEM = """You are InsightX's report generator for a startup analytics platform.
Respond ONLY with a valid JSON object:
{
  "title": "report title",
  "executive_summary": "2-3 sentence executive overview",
  "highlights": ["3-4 key achievement strings"],
  "concerns": ["1-2 concern strings"],
  "recommendations": ["2-3 recommendation strings"],
  "forecast": "1 sentence outlook"
}"""


@router.post("/insights")
async def generate_insights(payload: AIInsightRequest, current_user=Depends(get_current_user)):
    user_prompt = f"Analyze: {json.dumps(payload.context)}\n\nAdditional context: {payload.prompt}"
    raw = await generate_text(INSIGHT_SYSTEM, user_prompt)

    try:
        clean = raw.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        return {
            "headline": "Analytics Insight",
            "summary": raw[:300],
            "recommendation": "Review data and take appropriate action.",
            "severity": "info"
        }


@router.post("/generate-report")
async def generate_report(payload: AIReportRequest, current_user=Depends(get_current_user)):
    user_prompt = f"Report type: {payload.report_type}\nData: {json.dumps(payload.analytics_data)}"
    raw = await generate_text(REPORT_SYSTEM, user_prompt)

    try:
        clean = raw.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        return {
            "title": f"{payload.report_type.title()} Analytics Report",
            "executive_summary": raw[:300],
            "highlights": ["Data processed successfully"],
            "concerns": [],
            "recommendations": ["Review the raw output above"],
            "forecast": "Continue monitoring metrics."
        }


@router.post("/chat")
async def ai_chat(payload: dict, current_user=Depends(get_current_user)):
    messages = payload.get("messages", [])
    context  = payload.get("context", {})

    system = f"""You are InsightX's AI assistant — an intelligent analytics copilot.
Platform context: {json.dumps(context)}
Answer questions about contributor performance, tasks, and analytics concisely and professionally."""

    # Build conversation
    history = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages[-6:])
    response = await generate_text(system, history)
    return {"response": response}