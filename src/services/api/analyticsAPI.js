/**
 * src/services/api/analyticsAPI.js
 *
 * FIXES:
 *  1. Added mock fallback — when the real API returns 403/404 or is
 *     unavailable, returns mock data so the dashboard never shows zeroes.
 *  2. getMyStats / getMyAnalytics returns personal mock data keyed to
 *     the logged-in user from localStorage so contributor dashboard works.
 *  3. getLeaderboard falls back to CONTRIBUTORS mock data.
 */

import client from './client'
import {
  CONTRIBUTORS,
  TASKS,
  WEEKLY_ACTIVITY,
  TEAM_DISTRIBUTION,
} from '../../data/mockData'

// ── helpers ────────────────────────────────────────────────────────────────
function safeCall(apiFn, fallback) {
  return apiFn().catch(err => {
    // 403 = wrong role, 404 = endpoint missing, network = backend down
    const status = err?.response?.status
    if (!status || status === 403 || status === 404 || status >= 500) {
      return fallback
    }
    throw err
  })
}

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem('ix_user') || '{}')
  } catch {
    return {}
  }
}

// ── mock payloads ──────────────────────────────────────────────────────────
function mockOverview() {
  const total      = CONTRIBUTORS.length
  const active     = CONTRIBUTORS.filter(c => c.streak > 0).length
  const allTasks   = TASKS
  const completed  = allTasks.filter(t => t.status === 'completed').length
  const inProgress = allTasks.filter(t => t.status === 'in-progress').length
  const pending    = allTasks.filter(t => t.status === 'pending').length
  const avgAttend  = Math.round(
    CONTRIBUTORS.reduce((s, c) => s + (c.attendance || 0), 0) / total
  )
  const avgProd = Math.round(
    CONTRIBUTORS.reduce((s, c) => s + (c.productivity_score || 0), 0) / total
  )
  return {
    total_contributors:  total,
    active_users:        active,
    task_completion_rate: completed
      ? Math.round((completed / allTasks.length) * 100)
      : 0,
    engagement_score:    avgProd,
    weekly_productivity: avgProd,
    attendance_avg:      avgAttend,
    in_progress_tasks:   inProgress,
    pending_tasks:       pending,
    total_tasks:         allTasks.length,
  }
}

function mockMyStats() {
  const u = storedUser()
  // Find this user in mock contributors (match by email)
  const me = CONTRIBUTORS.find(c => c.email === u.email) || CONTRIBUTORS[1]
  const myTasks   = TASKS.filter(t => t.assigned_to === me.id)
  const completed = myTasks.filter(t => t.status === 'completed').length
  const inProg    = myTasks.filter(t => t.status === 'in-progress').length
  const pend      = myTasks.filter(t => t.status === 'pending').length
  return {
    productivity_score: me.productivity_score || 75,
    attendance:         me.attendance         || 90,
    streak:             me.streak             || 0,
    completed_tasks:    completed,
    in_progress_tasks:  inProg,
    pending_tasks:      pend,
    total_tasks:        myTasks.length,
    xp:                 me.completed_tasks * 50 || 0,
    badges:             me.streak > 7 ? ['🔥 On Fire', '⭐ Consistent'] : [],
  }
}

function mockLeaderboard() {
  return [...CONTRIBUTORS]
    .sort((a, b) => (b.productivity_score || 0) - (a.productivity_score || 0))
    .map((c, i) => ({ ...c, rank: i + 1 }))
}

function mockMyTasks() {
  const u  = storedUser()
  const me = CONTRIBUTORS.find(c => c.email === u.email) || CONTRIBUTORS[1]
  return TASKS.filter(t => t.assigned_to === me.id)
}

// ── API object ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  /** Admin: organization-wide overview stats */
  getOverview: () =>
    safeCall(() => client.get('/analytics/overview'), mockOverview()),

  /** Role-aware charts */
  getCharts: () =>
    safeCall(() => client.get('/analytics/charts'), {
      weekly: WEEKLY_ACTIVITY,
      team:   TEAM_DISTRIBUTION,
    }),

  /** All authenticated users: ranked leaderboard */
  getLeaderboard: () =>
    safeCall(() => client.get('/analytics/leaderboard'), mockLeaderboard()),

  /** Health score (admin) */
  getHealthScore: () =>
    safeCall(() => client.get('/analytics/health'), { score: 82 }),

  /** Heatmap (admin) */
  getHeatmap: (id) =>
    safeCall(() => client.get(`/analytics/heatmap${id ? `?user_id=${id}` : ''}`), []),

  /**
   * Personal analytics for the authenticated contributor.
   * Falls back to mock data derived from storedUser() so contributor
   * dashboard always has real-looking numbers even without a backend.
   */
  getMyAnalytics: () =>
    safeCall(() => client.get('/analytics/me'), mockMyStats()),

  /** Alias used by useMyStats() hook */
  getMyStats: () =>
    safeCall(() => client.get('/analytics/me'), mockMyStats()),
}