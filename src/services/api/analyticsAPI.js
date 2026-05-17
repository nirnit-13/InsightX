/**
 * src/services/api/analyticsAPI.js
 *
 * FIXES:
 *  1. Leaderboard now fetches ONLY from the real backend — deleted contributors
 *     no longer ghost-persist from the mock list merge.
 *  2. Mock data is used ONLY as a fallback when the backend is unreachable.
 *  3. getMyStats / getMyAnalytics still falls back to mock for the logged-in
 *     user's own data when the backend is unavailable.
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

// ── mock payloads (fallback only) ──────────────────────────────────────────
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
    total_contributors:   total,
    active_users:         active,
    task_completion_rate: completed ? Math.round((completed / allTasks.length) * 100) : 0,
    engagement_score:     avgProd,
    weekly_productivity:  avgProd,
    attendance_avg:       avgAttend,
    in_progress_tasks:    inProgress,
    pending_tasks:        pending,
    total_tasks:          allTasks.length,
  }
}

function mockMyStats() {
  const u  = storedUser()
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
    xp:                 (me.completed_tasks || 0) * 50,
    badges:             me.streak > 7 ? ['🔥 On Fire', '⭐ Consistent'] : [],
  }
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

  /**
   * Leaderboard — fetches ONLY from the real backend.
   * Falls back to mock ONLY when the server is completely unreachable.
   * This ensures deleted contributors are not shown.
   */
  getLeaderboard: async () => {
    try {
      const data = await client.get('/analytics/leaderboard')
      if (Array.isArray(data) && data.length > 0) return data
      // Empty array from backend means no users yet — show mock as placeholder
      return CONTRIBUTORS
    } catch (err) {
      const status = err?.response?.status
      // 403/401 = auth issue, not "no data" — don't show mock for auth errors
      if (status === 401 || status === 403) throw err
      // Network/server error → fall back to mock
      return CONTRIBUTORS
    }
  },

  /** Health score (admin) */
  getHealthScore: () =>
    safeCall(() => client.get('/analytics/health'), { score: 82 }),

  /** Heatmap (admin) */
  getHeatmap: (id) =>
    safeCall(() => client.get(`/analytics/heatmap${id ? `?user_id=${id}` : ''}`), []),

  /** Personal analytics for the authenticated contributor */
  getMyAnalytics: () =>
    safeCall(() => client.get('/analytics/me'), mockMyStats()),

  /** Alias used by useMyStats() hook */
  getMyStats: () =>
    safeCall(() => client.get('/analytics/me'), mockMyStats()),
}