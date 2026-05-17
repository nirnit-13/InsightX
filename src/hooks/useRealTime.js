/**
 * src/hooks/useRealTime.js
 *
 * UPDATED:
 *  1. Activity feed pulls contributors from both the mock list AND the real API
 *     so new users appear in the live feed just like original ones.
 *  2. generateActivityEvent is used from mockData so simulation logic is shared.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { OVERVIEW_STATS, CONTRIBUTORS, mergeContributors, generateActivityEvent } from '../data/mockData'

// ── Simulated live data fluctuation ───────────────────────────────────────
function fluctuate(base, maxDelta = 3) {
  return Math.max(0, Math.round(base + (Math.random() - 0.5) * maxDelta * 2))
}

function generateLiveStats() {
  return {
    ...OVERVIEW_STATS,
    active_users:        fluctuate(OVERVIEW_STATS.active_users, 1),
    engagement_score:    fluctuate(OVERVIEW_STATS.engagement_score, 2),
    weekly_productivity: fluctuate(OVERVIEW_STATS.weekly_productivity, 1.5),
    total_commits_week:  fluctuate(172, 8),
    live_sessions:       fluctuate(3, 2),
    last_updated:        new Date().toISOString(),
  }
}

// ── Hook: useRealTimeStats ─────────────────────────────────────────────────
export function useRealTimeStats(intervalMs = 15000) {
  const [stats, setStats]         = useState(generateLiveStats)
  const [isLive, setIsLive]       = useState(true)
  const [lastPulse, setLastPulse] = useState(new Date())
  const [pulseActive, setPulseActive] = useState(false)
  const intervalRef = useRef(null)

  const poll = useCallback(() => {
    setStats(generateLiveStats())
    setLastPulse(new Date())
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

  const toggle  = () => setIsLive(p => !p)
  const refresh = () => { poll() }

  return { stats, isLive, toggle, refresh, lastPulse, pulseActive }
}

// ── Helper: get a pool of ALL contributors (mock + any added via API) ──────
function getContributorPool() {
  // Try to pull any extra contributors that were added in this session
  // from localStorage (saved by the Contributors page state)
  try {
    const extra = JSON.parse(localStorage.getItem('ix_extra_contributors') || '[]')
    return mergeContributors(extra)
  } catch {
    return CONTRIBUTORS
  }
}

// ── Hook: useActivityFeed ──────────────────────────────────────────────────
// Generates live activity events for ALL contributors — original AND new ones
export function useActivityFeed(maxItems = 8) {
  const [feed, setFeed] = useState(() => {
    const pool = getContributorPool()
    return pool.slice(0, 5).map((c, i) => ({
      ...generateActivityEvent(c),
      id: `init-${i}`,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 4).toISOString(),
    }))
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh contributor pool each tick — picks up any newly added contributors
      const pool = getContributorPool()
      const contributor = pool[Math.floor(Math.random() * pool.length)]
      const event = generateActivityEvent(contributor)
      setFeed(prev => [
        { ...event, id: `live-${Date.now()}`, timestamp: new Date().toISOString() },
        ...prev.slice(0, maxItems - 1),
      ])
    }, 18000)
    return () => clearInterval(interval)
  }, [maxItems])

  return feed
}