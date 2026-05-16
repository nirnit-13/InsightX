import client from './client'

export const analyticsAPI = {
  getOverview:     ()   => client.get('/analytics/overview'),
  getCharts:       ()   => client.get('/analytics/charts'),
  getLeaderboard:  ()   => client.get('/analytics/leaderboard'),
  getHealthScore:  ()   => client.get('/analytics/health'),
  getHeatmap:      (id) => client.get(`/analytics/heatmap${id ? `?user_id=${id}` : ''}`),
  getMyStats:      ()   => client.get('/analytics/me'),
}