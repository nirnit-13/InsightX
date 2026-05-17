/**
 * src/services/api/analyticsAPI.js
 *
 * FIXES:
 *  1. Leaderboard always merges real API contributors WITH the original mock
 *     contributors — neither set ever disappears.
 *  2. New contributors from the API get simulated stats (via simulateContributorStats)
 *     so they appear properly ranked alongside old contributors.
 *  3. getMyStats / getMyAnalytics returns personal mock data keyed to
 *     the logged-in user from localStorage so contributor dashboard works.
 */

import client from './client'
import {
  CONTRIBUTORS,
  TASKS,
  WEEKLY_ACTIVITY,
  TEAM_DISTRIBUTION,
  mergeContributors,
  simulateContributorStats,
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

/**
 * Build a merged leaderboard from both the real API and the original mock
 * contributors.  Real API contributors that aren't in the mock list get
 * simulated stats added.  The mock list is always included.
 */
async function buildMergedLeaderboard() {
  let apiContributors = []
  try {
    apiContributors = await client.get('/analytics/leaderboard')
    if (!Array.isArray(apiContributors)) apiContributors = []
  } catch {
    // backend unavailable — proceed with mock only
  }

  // mergeContributors deduplicates by email, mock list wins for original users
  const merged = mergeContributors(apiContributors)
  return merged.sort((a, b) => (b.productivity_score || 0) - (a.productivity_score || 0))
}

/**
 * Build a merged contributors list for admin /contributors/ view.
 * Combines real API list + original mock contributors.
 */
async function buildMergedContributors() {
  let apiContributors = []
  try {
    apiContributors = await client.get('/contributors/')
    if (!Array.isArray(apiContributors)) apiContributors = []
  } catch {
    // backend unavailable
  }
  return mergeContributors(apiContributors)
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
   * UPDATED: Leaderboard merges real API + all original mock contributors.
   * New users added via the UI appear alongside original contributors.
   */
  getLeaderboard: () => buildMergedLeaderboard(),

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

  /** All contributors merged (for admin views) */
  getAllContributors: () => buildMergedContributors(),
}