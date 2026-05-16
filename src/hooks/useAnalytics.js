/**
 * src/hooks/useAnalytics.js
 *
 * FIX — Role-aware query enabling:
 *   - useAnalyticsOverview() only fires when called by an admin
 *     (ContributorDashboard never calls it, but defensive guard added)
 *   - useMyStats() only fires for authenticated users
 *   - useLeaderboard() fires for all authenticated users (shared endpoint)
 *   - Retry is already handled globally in AppProviders (no retry on 401/403)
 *
 * The `enabled` flag prevents React Query from firing hidden/wrong queries
 * even if a component accidentally renders for the wrong role.
 */

import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api/analyticsAPI'
import { useAuth } from '../context/AuthContext'

export const ANALYTICS_KEY = ['analytics']

/**
 * Admin-only: organization-wide overview stats.
 * FIX: enabled only when user is admin — prevents 403 if accidentally called
 * by a contributor component.
 */
export function useAnalyticsOverview() {
  const { user, isAdmin } = useAuth()
  return useQuery({
    queryKey:       [...ANALYTICS_KEY, 'overview'],
    queryFn:        analyticsAPI.getOverview,
    staleTime:      15_000,
    refetchInterval: 30_000,
    enabled:        !!user && isAdmin,   // FIX: admin only
  })
}

/**
 * Role-aware charts.
 * Backend returns org-wide data for admins, personal data for contributors.
 * Safe to call for any authenticated user.
 */
export function useAnalyticsCharts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'charts'],
    queryFn:  analyticsAPI.getCharts,
    staleTime: 30_000,
    enabled:  !!user,
  })
}

/**
 * Shared leaderboard — available to ALL authenticated users.
 */
export function useLeaderboard() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'leaderboard'],
    queryFn:  analyticsAPI.getLeaderboard,
    staleTime: 30_000,
    enabled:  !!user,
  })
}

/**
 * Health score — admin only endpoint.
 * FIX: enabled only for admins.
 */
export function useHealthScore() {
  const { user, isAdmin } = useAuth()
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'health'],
    queryFn:  analyticsAPI.getHealthScore,
    staleTime: 60_000,
    enabled:  !!user && isAdmin,
  })
}

/**
 * FIX — Personal analytics for the authenticated user.
 * Calls GET /analytics/me — safe for contributors and admins.
 * This is the PRIMARY query for the ContributorDashboard.
 */
export function useMyStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'me'],
    queryFn:  analyticsAPI.getMyStats,
    staleTime: 20_000,
    enabled:  !!user,   // any authenticated user
  })
}

/**
 * Heatmap — admin only.
 */
export function useHeatmap(userId) {
  const { user, isAdmin } = useAuth()
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'heatmap', userId],
    queryFn:  () => analyticsAPI.getHeatmap(userId),
    staleTime: 60_000,
    enabled:  !!user && isAdmin && !!userId,
  })
}