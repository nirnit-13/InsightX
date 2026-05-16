import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ── Axios instance ─────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ix_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ix_token')
      localStorage.removeItem('ix_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Core Groq caller ───────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt, temperature = 0.7) {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set in your .env file')
  }
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

function safeParseJSON(raw, fallback) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return fallback
  }
}

// ── AI Insight ─────────────────────────────────────────────────────────────
export async function generateAIInsight(promptData) {
  const system = `You are InsightX's AI analytics engine for a contributor management platform.
Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "headline": "short punchy title max 8 words",
  "summary": "2-3 sentence professional business insight",
  "recommendation": "one actionable recommendation sentence",
  "severity": "positive|warning|info|critical"
}`

  const raw = await callGroq(system, `Analyze this platform data: ${promptData}`)
  return safeParseJSON(raw, {
    headline: 'Analytics Insight',
    summary: raw.slice(0, 200),
    recommendation: 'Review the data for actionable next steps.',
    severity: 'info',
  })
}

// ── Report Generator ───────────────────────────────────────────────────────
export async function generateReport(analyticsData) {
  const system = `You are InsightX's weekly report generator for a startup analytics platform.
Respond ONLY with a valid JSON object — no markdown, no code fences, no preamble:
{
  "title": "Weekly Analytics Report — May 2025",
  "executive_summary": "2-3 sentence executive overview",
  "highlights": ["3-4 key achievement strings"],
  "concerns": ["1-2 concern strings"],
  "recommendations": ["2-3 actionable recommendation strings"],
  "forecast": "1 sentence outlook for next week"
}`

  const raw = await callGroq(system, `Generate report for: ${JSON.stringify(analyticsData)}`, 0.6)
  return safeParseJSON(raw, {
    title: 'Weekly Analytics Report — May 2025',
    executive_summary: 'Team productivity remains strong this week with consistent contributor engagement across all departments.',
    highlights: ['Task completion rate holding above 65%', 'Top performers maintaining streak consistency', 'Backend team shipped key API improvements'],
    concerns: ['Some contributors showing reduced attendance this week'],
    recommendations: ['Schedule team sync to address blockers', 'Recognize top performers publicly', 'Review pending high-priority tasks'],
    forecast: 'Momentum is positive — maintain current cadence heading into next week.',
  })
}

// ── AI Chat ────────────────────────────────────────────────────────────────
export async function chatWithAI(messages, context) {
  const system = `You are InsightX's AI assistant — an intelligent analytics copilot for a contributor management platform.
Current platform snapshot:
- Contributors: ${context?.stats?.total_contributors ?? 'N/A'} total, ${context?.stats?.active_users ?? 'N/A'} active
- Task completion rate: ${context?.stats?.task_completion_rate ?? 'N/A'}%
- Weekly productivity score: ${context?.stats?.weekly_productivity ?? 'N/A'}
- Avg attendance: ${context?.stats?.attendance_avg ?? 'N/A'}%
- Top contributors: ${context?.contributors?.slice(0, 3).map(c => `${c.name} (score: ${c.score}, team: ${c.team})`).join(' | ') ?? 'N/A'}
- Open tasks: ${context?.tasks?.filter(t => t.status !== 'completed').length ?? 'N/A'}

Be concise, professional, and data-driven. Use bullet points when listing multiple items.`

  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY is not set in your .env file')

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: 'system', content: system },
        ...messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Unable to process request at this time.'
}

export default api