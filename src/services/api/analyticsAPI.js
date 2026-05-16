/**
 * src/services/api/analyticsAPI.js
 *
 * FIX — Added getMyAnalytics() which calls GET /analytics/me.
 *   This is the endpoint the contributor dashboard must use instead of
 *   /analytics/overview (which is admin-scoped).
 *
 *   Without this function, ContributorDashboard had no role-correct API
 *   call to make, so it fell back to admin endpoints and got 403 errors.
 */

import client from './client'

export const analyticsAPI = {
  /** Admin: organization-wide overview stats */
  getOverview: () => client.get('/analytics/overview'),

  /**
   * Role-aware charts.
   * Admin   → org-wide top contributors + team distribution.
   * Contributor → personal task breakdown only.
   */
  getCharts: () => client.get('/analytics/charts'),

  /** All authenticated users: ranked leaderboard */
  getLeaderboard: () => client.get('/analytics/leaderboard'),

  /** (Legacy / unused) */
  getHealthScore: () => client.get('/analytics/health'),

  /** (Legacy / unused) */
  getHeatmap: (id) => client.get(`/analytics/heatmap${id ? `?user_id=${id}` : ''}`),

  /**
   * FIX — NEW: Personal analytics for the authenticated contributor.
   * Calls GET /analytics/me.
   * Returns: assigned_tasks, completed_tasks, productivity stats, streak,
   *          xp, badges, completion_rate.
   *
   * The contributor dashboard and useMyStats() hook must call this,
   * NOT getOverview() or getCharts().
   */
  getMyAnalytics: () => client.get('/analytics/me'),

  /**
   * Alias for getMyAnalytics — used by the existing useMyStats() hook
   * which calls analyticsAPI.getMyStats().
   */
  getMyStats: () => client.get('/analytics/me'),
}