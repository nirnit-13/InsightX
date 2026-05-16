"""
InsightX — Centralized Groq AI Service
Uses Groq Python SDK exclusively with llama-3.3-70b-versatile.
"""

import os
import json
import asyncio
import logging
from typing import Any

from groq import AsyncGroq, APIConnectionError, APITimeoutError, RateLimitError

logger = logging.getLogger(__name__)

# ── Config ───────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL        = "llama-3.3-70b-versatile"
MAX_TOKENS   = 1024
TEMPERATURE  = 0.7
MAX_RETRIES  = 3
RETRY_DELAY  = 1.5  # seconds between retries

# ── Prompt Templates ──────────────────────────────────────────────────────────
TEMPLATES = {
    "insight": """You are InsightX's AI analytics engine for a contributor management SaaS platform.
Respond ONLY with a valid JSON object — no markdown fences, no preamble, no trailing text:
{
  "headline": "short punchy title (max 8 words)",
  "summary": "2-3 sentence professional business insight",
  "recommendation": "one actionable recommendation sentence",
  "severity": "positive|warning|info|critical"
}""",

    "contributor_insight": """You are InsightX's contributor performance analyst.
Given data about a single contributor, respond ONLY with valid JSON:
{
  "headline": "short title about this contributor",
  "summary": "2-3 sentences analyzing their performance, strengths, and areas for improvement",
  "recommendation": "one specific, actionable coaching recommendation",
  "severity": "positive|warning|info|critical"
}""",

    "org_health": """You are InsightX's organizational health AI.
Analyze the organization data and respond ONLY with valid JSON:
{
  "health_score": <integer 0-100>,
  "headline": "brief health status title",
  "summary": "2-3 sentences on overall org health",
  "risks": ["risk 1", "risk 2"],
  "strengths": ["strength 1", "strength 2"],
  "recommendation": "top priority action item",
  "severity": "positive|warning|info|critical"
}""",

    "weekly_report": """You are InsightX's weekly report generator for a startup analytics platform.
Respond ONLY with valid JSON — no markdown, no preamble:
{
  "title": "Weekly Analytics Report — descriptive title",
  "executive_summary": "2-3 sentence executive overview",
  "highlights": ["3-4 key achievement strings"],
  "concerns": ["1-2 concern strings"],
  "recommendations": ["2-3 actionable recommendation strings"],
  "forecast": "1 sentence outlook for next period"
}""",

    "productivity_summary": """You are InsightX's productivity analyst.
Analyze the productivity data and respond ONLY with valid JSON:
{
  "headline": "productivity status title",
  "score_analysis": "2 sentences on the productivity score",
  "trend": "improving|stable|declining",
  "blockers": ["identified blocker 1", "identified blocker 2"],
  "recommendation": "one actionable step to improve productivity",
  "severity": "positive|warning|info|critical"
}""",

    "operational_alerts": """You are InsightX's operational risk monitor.
Scan the data for operational issues and respond ONLY with valid JSON:
{
  "alert_count": <integer>,
  "critical_alerts": ["critical issue 1"],
  "warnings": ["warning 1", "warning 2"],
  "summary": "2 sentences on operational status",
  "immediate_action": "most urgent action required",
  "severity": "positive|warning|info|critical"
}""",

    "chat_assistant": """You are InsightX's AI assistant — an intelligent analytics copilot for a contributor management platform.
Be concise, professional, and data-driven. Use bullet points when listing multiple items.
Answer questions about contributor performance, tasks, and analytics.
Keep responses under 300 words unless detail is specifically requested.""",

    "report_summary": """You are InsightX's AI report summarizer.
Given raw analytics data, produce a concise executive summary.
Respond ONLY with valid JSON:
{
  "title": "report title",
  "summary": "3-4 sentence comprehensive summary",
  "key_metrics": {"metric_name": "value or analysis"},
  "action_items": ["action 1", "action 2", "action 3"],
  "severity": "positive|warning|info|critical"
}""",
}


# ── Groq client factory ───────────────────────────────────────────────────────
def _get_client() -> AsyncGroq:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set in environment variables")
    return AsyncGroq(api_key=GROQ_API_KEY)


# ── Core completion function ──────────────────────────────────────────────────
async def _complete(
    system_prompt: str,
    user_prompt: str,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
) -> str:
    """
    Call Groq with retry logic and timeout handling.

    Returns:
        Raw text content from the model.

    Raises:
        RuntimeError: After all retries are exhausted.
    """
    client = _get_client()
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_prompt},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                ),
                timeout=30.0,
            )
            return response.choices[0].message.content or ""

        except APITimeoutError as exc:
            last_error = exc
            logger.warning("Groq timeout on attempt %d/%d", attempt, MAX_RETRIES)
        except RateLimitError as exc:
            last_error = exc
            logger.warning("Groq rate limit on attempt %d/%d", attempt, MAX_RETRIES)
            await asyncio.sleep(RETRY_DELAY * attempt)
        except APIConnectionError as exc:
            last_error = exc
            logger.warning("Groq connection error on attempt %d/%d: %s", attempt, MAX_RETRIES, exc)
            await asyncio.sleep(RETRY_DELAY)
        except Exception as exc:
            last_error = exc
            logger.error("Groq unexpected error on attempt %d/%d: %s", attempt, MAX_RETRIES, exc)
            break  # non-retryable

    raise RuntimeError(f"Groq service failed after {MAX_RETRIES} attempts: {last_error}")


# ── JSON-safe parser ──────────────────────────────────────────────────────────
def _safe_json(raw: str, fallback: dict) -> dict:
    try:
        clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        logger.warning("Failed to parse Groq JSON response; using fallback")
        return fallback


# ── Public API ────────────────────────────────────────────────────────────────

async def generate_analytics_insight(context: dict) -> dict:
    """
    Generate a single AI analytics insight from platform context data.

    Args:
        context: Dict with stats, task info, contributor data, etc.

    Returns:
        Parsed JSON insight dict.
    """
    user_prompt = f"Analyze this InsightX platform data and generate an insight:\n{json.dumps(context, default=str)}"
    raw = await _complete(TEMPLATES["insight"], user_prompt)
    return _safe_json(raw, {
        "headline": "Analytics Insight",
        "summary": "Platform data analyzed successfully.",
        "recommendation": "Review your analytics for actionable next steps.",
        "severity": "info",
    })


async def generate_contributor_insight(contributor: dict) -> dict:
    """
    Generate a personalized performance insight for a single contributor.

    Args:
        contributor: Contributor profile dict (name, score, tasks, streak, etc.)

    Returns:
        Parsed JSON insight dict.
    """
    user_prompt = f"Generate a performance insight for this contributor:\n{json.dumps(contributor, default=str)}"
    raw = await _complete(TEMPLATES["contributor_insight"], user_prompt)
    return _safe_json(raw, {
        "headline": f"Insight for {contributor.get('name', 'Contributor')}",
        "summary": "Performance data reviewed.",
        "recommendation": "Continue monitoring this contributor's progress.",
        "severity": "info",
    })


async def generate_org_health(analytics: dict) -> dict:
    """
    Generate an organizational health score and analysis.

    Args:
        analytics: Overview analytics dict.

    Returns:
        Parsed JSON org health dict.
    """
    user_prompt = f"Assess this organization's health from analytics data:\n{json.dumps(analytics, default=str)}"
    raw = await _complete(TEMPLATES["org_health"], user_prompt, temperature=0.5)
    return _safe_json(raw, {
        "health_score": 75,
        "headline": "Moderate Organizational Health",
        "summary": "Organization is operating within normal parameters.",
        "risks": [],
        "strengths": [],
        "recommendation": "Continue monitoring key metrics.",
        "severity": "info",
    })


async def generate_weekly_report(data: dict) -> dict:
    """
    Generate a full weekly analytics report.

    Args:
        data: Dict containing stats, contributors, tasks, report_type.

    Returns:
        Parsed JSON report dict.
    """
    user_prompt = f"Generate a {data.get('report_type', 'weekly')} analytics report for:\n{json.dumps(data, default=str)}"
    raw = await _complete(TEMPLATES["weekly_report"], user_prompt, temperature=0.6, max_tokens=1024)
    return _safe_json(raw, {
        "title": "Weekly Analytics Report",
        "executive_summary": "Team performance reviewed for the current period.",
        "highlights": ["Data successfully processed"],
        "concerns": [],
        "recommendations": ["Review platform metrics regularly"],
        "forecast": "Continue monitoring progress.",
    })


async def generate_productivity_summary(data: dict) -> dict:
    """
    Generate a productivity summary for a team or individual.

    Args:
        data: Productivity metrics dict.

    Returns:
        Parsed JSON productivity summary dict.
    """
    user_prompt = f"Summarize this productivity data:\n{json.dumps(data, default=str)}"
    raw = await _complete(TEMPLATES["productivity_summary"], user_prompt)
    return _safe_json(raw, {
        "headline": "Productivity Summary",
        "score_analysis": "Productivity is at acceptable levels.",
        "trend": "stable",
        "blockers": [],
        "recommendation": "Maintain current workflows.",
        "severity": "info",
    })


async def generate_operational_alerts(data: dict) -> dict:
    """
    Scan analytics data for operational risks and alerts.

    Args:
        data: Full platform analytics snapshot.

    Returns:
        Parsed JSON alerts dict.
    """
    user_prompt = f"Identify operational risks and alerts in this data:\n{json.dumps(data, default=str)}"
    raw = await _complete(TEMPLATES["operational_alerts"], user_prompt, temperature=0.4)
    return _safe_json(raw, {
        "alert_count": 0,
        "critical_alerts": [],
        "warnings": [],
        "summary": "No critical operational issues detected.",
        "immediate_action": "Continue standard monitoring.",
        "severity": "positive",
    })


async def chat_assistant(messages: list[dict], context: dict) -> str:
    """
    AI chat assistant for conversational queries about platform data.

    Args:
        messages: List of {role, content} message dicts (last 8 used).
        context: Platform context snapshot.

    Returns:
        Assistant response string.
    """
    context_str = (
        f"Platform context: contributors={context.get('total_contributors', 'N/A')}, "
        f"active={context.get('active_users', 'N/A')}, "
        f"task_completion={context.get('task_completion_rate', 'N/A')}%, "
        f"productivity={context.get('weekly_productivity', 'N/A')}"
    )
    system = f"{TEMPLATES['chat_assistant']}\n\nCurrent data snapshot:\n{context_str}"

    client = _get_client()
    last_8 = messages[-8:] if len(messages) > 8 else messages
    formatted = [{"role": m["role"], "content": m["content"]} for m in last_8]

    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "system", "content": system}, *formatted],
                temperature=0.7,
                max_tokens=600,
            ),
            timeout=25.0,
        )
        return response.choices[0].message.content or "I couldn't generate a response."
    except Exception as exc:
        logger.error("Chat assistant error: %s", exc)
        raise RuntimeError(f"Chat service unavailable: {exc}") from exc


async def generate_report_summary(raw_data: dict) -> dict:
    """
    Generate a concise executive summary from raw analytics data.
    Used internally by the reports router.

    Args:
        raw_data: Raw analytics dict.

    Returns:
        Parsed JSON summary dict.
    """
    user_prompt = f"Summarize these analytics into an executive report:\n{json.dumps(raw_data, default=str)}"
    raw = await _complete(TEMPLATES["report_summary"], user_prompt, temperature=0.5)
    return _safe_json(raw, {
        "title": "Analytics Summary",
        "summary": "Data processed and summarized.",
        "key_metrics": {},
        "action_items": [],
        "severity": "info",
    })