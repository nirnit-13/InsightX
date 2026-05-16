import { useState, useEffect, useRef, useCallback } from 'react'
import { OVERVIEW_STATS, CONTRIBUTORS } from '../data/mockData'

// ── Simulated live data fluctuation ───────────────────────────────────────
function fluctuate(base, maxDelta = 3) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * maxDelta * 2))
}

function generateLiveStats() {
  return {
    ...OVERVIEW_STATS,
    active_users: fluctuate(OVERVIEW_STATS.active_users, 1),
    engagement_score: fluctuate(OVERVIEW_STATS.engagement_score, 2),
    weekly_productivity: fluctuate(OVERVIEW_STATS.weekly_productivity, 1.5),
    total_commits_week: fluctuate(172, 8),
    live_sessions: fluctuate(3, 2),
    last_updated: new Date().toISOString(),
  }
}

// ── Hook: useRealTimeStats ─────────────────────────────────────────────────
export function useRealTimeStats(intervalMs = 15000) {
  const [stats, setStats] = useState(generateLiveStats)
  const [isLive, setIsLive] = useState(true)
  const [lastPulse, setLastPulse] = useState(new Date())
  const [pulseActive, setPulseActive] = useState(false)
  const intervalRef = useRef(null)

  const poll = useCallback(() => {
    setStats(generateLiveStats())
    setLastPulse(new Date())
    // Flash the pulse indicator
    setPulseActive(true)
    setTimeout(() => setPulseActive(false), 1000)
  }, [])

  useEffect(() => {
    if (!isLive) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(poll, intervalMs)
    return () => clearInterval(intervalRef.current)
  }, [isLive, intervalMs, poll])

  const toggle = () => setIsLive(p => !p)
  const refresh = () => { poll() }

  return { stats, isLive, toggle, refresh, lastPulse, pulseActive }
}

// ── Hook: useActivityFeed ──────────────────────────────────────────────────
const BASE_EVENTS = [
  { type: 'commit',  icon: '📦', actor: 'Alex Rivera',  action: 'pushed 3 commits to main' },
  { type: 'task',    icon: '✅', actor: 'Maria Santos', action: 'completed "Analytics Pipeline"' },
  { type: 'review',  icon: '🔍', actor: 'Priya Nair',   action: 'approved PR #142' },
  { type: 'join',    icon: '👋', actor: 'Sam Chen',     action: 'started a new task' },
  { type: 'streak',  icon: '🔥', actor: 'Maria Santos', action: 'extended streak to 18 days' },
  { type: 'deploy',  icon: '🚀', actor: 'Jordan Lee',   action: 'deployed to staging' },
  { type: 'comment', icon: '💬', actor: 'Dev Patel',    action: 'left a code review comment' },
  { type: 'task',    icon: '📋', actor: 'Alex Rivera',  action: 'created task "Mobile Audit"' },
]

export function useActivityFeed(maxItems = 8) {
  const [feed, setFeed] = useState(() =>
    BASE_EVENTS.slice(0, 5).map((e, i) => ({
      ...e,
      id: `init-${i}`,
      timestamp: new Date(Date.now() - (i * 1000 * 60 * 4)).toISOString(),
    }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const event = BASE_EVENTS[Math.floor(Math.random() * BASE_EVENTS.length)]
      setFeed(prev => [
        { ...event, id: `live-${Date.now()}`, timestamp: new Date().toISOString() },
        ...prev.slice(0, maxItems - 1),
      ])
    }, 18000) // new event every 18s
    return () => clearInterval(interval)
  }, [maxItems])

  return feed
}