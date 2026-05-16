import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api/analyticsAPI'

export const ANALYTICS_KEY = ['analytics']

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'overview'],
    queryFn:  analyticsAPI.getOverview,
    staleTime: 15_000,
    refetchInterval: 30_000, // polling every 30s for realtime feel
  })
}

export function useAnalyticsCharts() {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'charts'],
    queryFn:  analyticsAPI.getCharts,
    staleTime: 30_000,
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'leaderboard'],
    queryFn:  analyticsAPI.getLeaderboard,
    staleTime: 30_000,
  })
}

export function useHealthScore() {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'health'],
    queryFn:  analyticsAPI.getHealthScore,
    staleTime: 60_000,
  })
}

export function useMyStats() {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'me'],
    queryFn:  analyticsAPI.getMyStats,
    staleTime: 20_000,
  })
}

export function useHeatmap(userId) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'heatmap', userId],
    queryFn:  () => analyticsAPI.getHeatmap(userId),
    staleTime: 60_000,
  })
}