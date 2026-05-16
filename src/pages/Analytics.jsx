import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAnalyticsOverview, useAnalyticsCharts, useLeaderboard } from '../hooks/useAnalytics'
import { StatCard, ProgressBar, Avatar, SectionHeader, Skeleton } from '../components/ui/Components'
import { GradientAreaChart, ActivityBarChart, DonutChart, TrendLineChart } from '../components/charts/Charts'
import AIRecommendationsPanel from '../components/ai/AIRecommendationsPanel'
import NoAnalytics from '../components/emptyStates/NoAnalytics'
import {
  WEEKLY_ACTIVITY, ENGAGEMENT_TREND, TEAM_DISTRIBUTION, MONTHLY_PRODUCTIVITY,
} from '../data/mockData'
import {
  RiBarChartBoxLine, RiTeamLine, RiTaskLine, RiFlashlightLine,
  RiRefreshLine, RiCalendarLine,
} from 'react-icons/ri'

const weeklyData    = WEEKLY_ACTIVITY.map(d => ({ name: d.day, Commits: d.commits, Tasks: d.tasks, Reviews: d.reviews }))
const engageData    = ENGAGEMENT_TREND.map(d => ({ name: d.week, Engagement: d.engagement, Retention: d.retention, NPS: d.nps }))
const monthlyData   = MONTHLY_PRODUCTIVITY.map(d => ({ name: d.month, Productivity: d.score, Contributions: d.contributions }))

export default function Analytics() {
  const { data: overview, isLoading: ol, refetch } = useAnalyticsOverview()
  const { data: charts,   isLoading: cl }           = useAnalyticsCharts()
  const { data: board,    isLoading: bl }            = useLeaderboard()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 600)
  }

  const analyticsContext = {
    overview,
    top_contributors: (board || []).slice(0, 5).map(c => ({
      name: c.name, score: c.productivity_score, team: c.team, attendance: c.attendance,
    })),
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-text flex items-center gap-3">
            <RiBarChartBoxLine className="text-ix-accent" /> Analytics Center
          </h1>
          <p className="text-ix-muted text-sm mt-1 flex items-center gap-2">
            <RiCalendarLine className="text-xs" />
            Real-time organization intelligence — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5 disabled:opacity-50">
          <RiRefreshLine className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ol ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />) : <>
          <StatCard label="Total Contributors"  value={overview?.total_contributors  ?? 0} delta={8}  icon={RiTeamLine}        color="#6366f1" />
          <StatCard label="Task Completion"     value={overview?.task_completion_rate ?? 0} delta={5}  icon={RiTaskLine}        color="#10b981" suffix="%" />
          <StatCard label="Weekly Productivity" value={overview?.weekly_productivity  ?? 0} delta={12} icon={RiFlashlightLine}  color="#8b5cf6" />
          <StatCard label="Engagement Score"    value={overview?.engagement_score    ?? 0} delta={3}  icon={RiBarChartBoxLine} color="#06b6d4" />
        </>}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users',   value: overview?.active_users    ?? 0, max: overview?.total_contributors ?? 10, color: '#6366f1' },
          { label: 'Avg Attendance', value: overview?.attendance_avg  ?? 0, max: 100,                                color: '#10b981', suffix: '%' },
          { label: 'In Progress',    value: overview?.in_progress_tasks ?? 0, max: Math.max(1, overview?.total_tasks ?? 10), color: '#06b6d4' },
          { label: 'Pending Tasks',  value: overview?.pending_tasks   ?? 0, max: Math.max(1, overview?.total_tasks ?? 10), color: '#f59e0b' },
        ].map((s, i) => ol ? <Skeleton key={i} className="h-24" /> : (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ix-muted">{s.label}</span>
              <span className="text-sm font-display font-bold text-ix-text">{s.value}{s.suffix}</span>
            </div>
            <ProgressBar value={s.value} max={s.max} color={s.color} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <SectionHeader title="Weekly Activity" subtitle="Commits, tasks & code reviews this week" />
          <ActivityBarChart
            data={weeklyData}
            bars={[{ key: 'Commits', color: '#6366f1' }, { key: 'Tasks', color: '#06b6d4' }, { key: 'Reviews', color: '#10b981' }]}
            height={220} />
        </div>
        <div className="card">
          <SectionHeader title="Team Distribution" subtitle="Contribution by team" />
          <DonutChart data={TEAM_DISTRIBUTION} height={160} />
          <div className="mt-3 space-y-1.5">
            {TEAM_DISTRIBUTION.map(t => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-ix-muted">{t.name}</span>
                </div>
                <span className="text-xs font-mono text-ix-text">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="Engagement Trend" subtitle="6-week engagement, retention & NPS" />
          <GradientAreaChart
            data={engageData}
            lines={[{ key: 'Engagement', color: '#8b5cf6' }, { key: 'Retention', color: '#06b6d4' }, { key: 'NPS', color: '#10b981' }]}
            height={200} />
        </div>
        <div className="card">
          <SectionHeader title="Productivity Trend" subtitle="5-month productivity score" />
          <TrendLineChart
            data={monthlyData}
            lines={[{ key: 'Productivity', color: '#6366f1', label: 'Productivity Score' }]}
            height={200} />
        </div>
      </div>

      {/* Task Breakdown + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="Task Breakdown" subtitle="Current status distribution" />
          {ol ? <Skeleton className="h-40" /> : (
            <div className="space-y-4">
              {[
                { label: 'Completed',   value: overview?.completed_tasks    ?? 0, total: overview?.total_tasks ?? 1, color: '#10b981' },
                { label: 'In Progress', value: overview?.in_progress_tasks  ?? 0, total: overview?.total_tasks ?? 1, color: '#06b6d4' },
                { label: 'Pending',     value: overview?.pending_tasks      ?? 0, total: overview?.total_tasks ?? 1, color: '#f59e0b' },
              ].map(s => {
                const pct = Math.round((s.value / Math.max(1, s.total)) * 100)
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-ix-muted">{s.label}</span>
                      <span className="font-mono font-semibold" style={{ color: s.color }}>{s.value} ({pct}%)</span>
                    </div>
                    <ProgressBar value={s.value} max={s.total} color={s.color} height={8} />
                  </div>
                )
              })}
              <div className="pt-2 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Total', value: overview?.total_tasks ?? 0, color: '#6366f1' },
                  { label: 'Done',  value: overview?.completed_tasks ?? 0, color: '#10b981' },
                  { label: 'Open',  value: (overview?.in_progress_tasks ?? 0) + (overview?.pending_tasks ?? 0), color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-3">
                    <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-ix-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <SectionHeader title="Top Performers" subtitle="Ranked by productivity score" />
          <div className="space-y-3">
            {bl ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />) :
              (board || []).slice(0, 5).map((c, i) => (
                <motion.div key={c.id || i}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-all">
                  <div className="w-6 text-center text-sm">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="font-mono text-ix-muted text-xs">#{i + 1}</span>}
                  </div>
                  <Avatar initials={c.avatar || c.name?.slice(0, 2).toUpperCase()} color={c.color || '#6366f1'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-ix-text truncate">{c.name}</p>
                    <p className="text-xs text-ix-muted">{c.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-ix-text">{c.productivity_score}</p>
                    <div className="w-16 mt-1">
                      <ProgressBar value={c.productivity_score} max={100} color={c.color || '#6366f1'} height={3} />
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <AIRecommendationsPanel context={analyticsContext} title="AI Analytics Insights" maxItems={4} />
    </div>
  )
}