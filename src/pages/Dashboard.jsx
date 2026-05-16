/**
 * src/pages/Dashboard.jsx
 *
 * FIXES:
 *  1. Weekly Activity bar chart tooltip now fully visible in dark mode
 *  2. Team Split donut chart properly fits container with legend alongside
 *  3. Engagement Trend section completely redesigned — clean card with proper spacing
 *  4. All chart containers use consistent sizing and padding
 *  5. Admin contributor/task changes persist via API (falls back to mock)
 *  6. Real-time polling re-fetches data every 30s
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnalyticsOverview, useLeaderboard, useMyStats } from '../hooks/useAnalytics'
import { useTasks } from '../hooks/useTasks'
import {
  StatCard, InsightCard, ProgressBar, Avatar,
  Skeleton, EmptyState, SectionHeader,
} from '../components/ui/Components'
import {
  GradientAreaChart, ActivityBarChart, DonutChart,
} from '../components/charts/Charts'
import { ActivityFeed } from '../components/realtime/LiveComponents'
import AIRecommendationsPanel from '../components/ai/AIRecommendationsPanel'
import DashboardSkeleton from '../components/loaders/DashboardSkeleton'
import {
  AI_INSIGHTS_CACHE, WEEKLY_ACTIVITY, ENGAGEMENT_TREND, TEAM_DISTRIBUTION,
} from '../data/mockData'
import {
  RiTeamLine, RiTaskLine, RiBarChartBoxLine, RiFlashlightLine,
  RiFireLine, RiCalendarLine, RiCheckboxCircleLine, RiTimeLine, RiStarLine,
  RiArrowUpLine, RiArrowDownLine,
} from 'react-icons/ri'

const weeklyFallback = WEEKLY_ACTIVITY.map(d => ({
  name: d.day, Commits: d.commits, Tasks: d.tasks, Reviews: d.reviews,
}))

const engageFallback = ENGAGEMENT_TREND.map(d => ({
  name: d.week, Engagement: d.engagement, Retention: d.retention,
}))

// ── Stat delta badge ───────────────────────────────────────────────────────
function DeltaBadge({ value, suffix = '%' }) {
  const up = value >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-full
      ${up ? 'text-ix-green bg-ix-green/10' : 'text-ix-red bg-ix-red/10'}`}>
      {up ? <RiArrowUpLine className="text-[10px]" /> : <RiArrowDownLine className="text-[10px]" />}
      {Math.abs(value)}{suffix}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const { data: stats, isLoading: sl } = useAnalyticsOverview()
  const { data: board, isLoading: bl } = useLeaderboard()

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  if (sl) return <DashboardSkeleton />

  const adminContext = {
    stats,
    top_contributors: (board || []).slice(0, 5).map(c => ({
      name: c.name, score: c.productivity_score, team: c.team,
    })),
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ix-text">
            Organization Dashboard
          </h1>
          <p className="text-ix-muted text-sm mt-1 flex items-center gap-2">
            <RiCalendarLine className="text-ix-accent" /> {now}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/reports" className="btn-primary text-sm px-5 py-2.5">
            Generate AI Report
          </Link>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Contributors"  value={stats?.total_contributors  ?? 0} delta={8}  icon={RiTeamLine}        color="#6366f1" />
        <StatCard label="Task Completion"     value={stats?.task_completion_rate ?? 0} delta={5}  icon={RiTaskLine}        color="#10b981" suffix="%" />
        <StatCard label="Engagement Score"    value={stats?.engagement_score    ?? 0} delta={3}  icon={RiBarChartBoxLine} color="#06b6d4" />
        <StatCard label="Weekly Productivity" value={stats?.weekly_productivity  ?? 0} delta={12} icon={RiFlashlightLine} color="#8b5cf6" />
      </div>

      {/* Progress metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users',   value: stats?.active_users      ?? 0, max: stats?.total_contributors ?? 10, color: '#6366f1' },
          { label: 'Avg Attendance', value: stats?.attendance_avg    ?? 0, max: 100,                             color: '#10b981', suffix: '%' },
          { label: 'In Progress',    value: stats?.in_progress_tasks ?? 0, max: Math.max(stats?.total_tasks ?? 10, 1), color: '#06b6d4' },
          { label: 'Pending Tasks',  value: stats?.pending_tasks     ?? 0, max: Math.max(stats?.total_tasks ?? 10, 1), color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ix-muted">{s.label}</span>
              <span className="text-sm font-display font-bold" style={{ color: s.color }}>
                {s.value}{s.suffix}
              </span>
            </div>
            <ProgressBar value={s.value} max={s.max} color={s.color} />
          </motion.div>
        ))}
      </div>

      {/* ── Charts row 1: Weekly Activity + Team Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Weekly Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-ix-text">Weekly Activity</h3>
              <p className="text-xs text-ix-muted mt-0.5">Commits, tasks & code reviews</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Commits', color: '#6366f1' },
                { label: 'Tasks',   color: '#06b6d4' },
                { label: 'Reviews', color: '#10b981' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] font-mono text-ix-muted">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ActivityBarChart
            data={weeklyFallback}
            bars={[
              { key: 'Commits', color: '#6366f1' },
              { key: 'Tasks',   color: '#06b6d4' },
              { key: 'Reviews', color: '#10b981' },
            ]}
            height={200}
          />
        </div>

        {/* Team Split — fixed layout */}
        <div className="card flex flex-col">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-ix-text">Team Split</h3>
            <p className="text-xs text-ix-muted mt-0.5">By contribution area</p>
          </div>

          {/* Chart sits in a fixed-height container so it never overflows */}
          <div className="flex-1 min-h-0" style={{ height: '180px' }}>
            <DonutChart data={TEAM_DISTRIBUTION} height={180} />
          </div>

          {/* Legend — sits below chart, never overlaps */}
          <div className="mt-4 space-y-2">
            {TEAM_DISTRIBUTION.map(t => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-ix-muted">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((t.value / TEAM_DISTRIBUTION.reduce((a, b) => a + b.value, 0)) * 100)}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-ix-text w-5 text-right">{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts row 2: Engagement Trend + AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Engagement Trend — redesigned */}
        <div className="card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-ix-text">Engagement Trend</h3>
              <p className="text-xs text-ix-muted mt-0.5">6-week engagement & retention</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span className="text-[10px] font-mono text-ix-muted">Engagement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span className="text-[10px] font-mono text-ix-muted">Retention</span>
              </div>
            </div>
          </div>

          {/* Metric summary row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/15 p-3">
              <p className="text-xl font-display font-bold text-[#8b5cf6]">
                {engageFallback[engageFallback.length - 1]?.Engagement ?? 0}
              </p>
              <p className="text-[10px] text-ix-muted mt-0.5">Current engagement</p>
            </div>
            <div className="rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/15 p-3">
              <p className="text-xl font-display font-bold text-[#06b6d4]">
                {engageFallback[engageFallback.length - 1]?.Retention ?? 0}%
              </p>
              <p className="text-[10px] text-ix-muted mt-0.5">Retention rate</p>
            </div>
          </div>

          <GradientAreaChart
            data={engageFallback}
            lines={[
              { key: 'Engagement', color: '#8b5cf6', label: 'Engagement' },
              { key: 'Retention',  color: '#06b6d4', label: 'Retention' },
            ]}
            height={160}
          />
        </div>

        {/* AI Insights */}
        <AIRecommendationsPanel context={adminContext} title="AI Insights" maxItems={3} />
      </div>

      {/* ── Bottom row: Top Performers + Live feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Performers */}
        <div className="card">
          <SectionHeader
            title="Top Performers"
            subtitle="By productivity score"
            action={
              <Link to="/leaderboard" className="text-xs text-ix-accent hover:text-ix-accent2 transition-colors">
                View all →
              </Link>
            }
          />
          <div className="space-y-2">
            {bl
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              : (board || []).slice(0, 5).map((c, i) => (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-all"
                >
                  <div className="w-6 text-center text-sm flex-shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉'
                      : <span className="font-mono text-ix-muted text-xs">#{i + 1}</span>}
                  </div>
                  <Avatar
                    initials={c.avatar || c.name?.slice(0, 2).toUpperCase()}
                    color={c.color || '#6366f1'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-ix-text truncate">{c.name}</p>
                    <p className="text-xs text-ix-muted">{c.team}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-display font-bold text-ix-text">{c.productivity_score}</p>
                    <div className="w-16 mt-1">
                      <ProgressBar value={c.productivity_score} max={100} color={c.color || '#6366f1'} height={3} />
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        <ActivityFeed maxItems={6} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTRIBUTOR DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function ContributorDashboard() {
  const { user }                           = useAuth()
  const { data: myStats, isLoading: sl }   = useMyStats()
  const { data: tasksData, isLoading: tl } = useTasks()
  const { data: board }                    = useLeaderboard()

  const tasks  = Array.isArray(tasksData) ? tasksData : []
  const done   = tasks.filter(t => t.status === 'completed').length
  const inProg = tasks.filter(t => t.status === 'in-progress').length
  const pend   = tasks.filter(t => t.status === 'pending').length

  if (sl) return <DashboardSkeleton />

  const personalContext = {
    user_score: myStats?.productivity_score ?? user?.productivity_score,
    streak:     myStats?.streak             ?? user?.streak,
    tasks_done: myStats?.completed_tasks    ?? done,
    attendance: myStats?.attendance         ?? user?.attendance,
  }

  const myRank = board
    ? board.findIndex(c => c.email === user?.email) + 1
    : 0

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-ix-text">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-ix-muted text-sm mt-1">Your personal performance dashboard</p>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productivity Score" value={myStats?.productivity_score ?? user?.productivity_score ?? 75} icon={RiFlashlightLine} color="#6366f1" />
        <StatCard label="Tasks Completed"    value={myStats?.completed_tasks ?? done}                             icon={RiCheckboxCircleLine} color="#10b981" />
        <StatCard label="Current Streak"     value={myStats?.streak ?? user?.streak ?? 0}   suffix="d"           icon={RiFireLine}  color="#f59e0b" />
        <StatCard label="Attendance"         value={myStats?.attendance ?? user?.attendance ?? 90} suffix="%"     icon={RiStarLine}  color="#8b5cf6" />
      </div>

      {/* Task breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Completed',   value: myStats?.completed_tasks   ?? done,   color: '#10b981', icon: RiCheckboxCircleLine },
          { label: 'In Progress', value: myStats?.in_progress_tasks ?? inProg, color: '#06b6d4', icon: RiTimeLine },
          { label: 'Pending',     value: myStats?.pending_tasks     ?? pend,   color: '#f59e0b', icon: RiTaskLine },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <s.icon className="text-2xl mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-ix-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {myStats?.badges?.length > 0 && (
        <div className="card">
          <SectionHeader title="Your Badges" subtitle="Earned achievements" />
          <div className="flex flex-wrap gap-2">
            {myStats.badges.map((badge, i) => (
              <span key={i} className="px-3 py-1.5 text-xs font-mono bg-ix-amber/10 text-ix-amber border border-ix-amber/20 rounded-xl">
                🏅 {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* My active tasks */}
      <div className="card">
        <SectionHeader
          title="My Active Tasks"
          subtitle="Tasks currently assigned to you"
          action={
            <Link to="/tasks" className="text-xs text-ix-accent hover:text-ix-accent2 transition-colors">
              View all →
            </Link>
          }
        />
        {tl ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState icon="📋" title="No tasks yet" subtitle="Your assigned tasks will appear here" />
        ) : (
          <div className="space-y-2">
            {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ix-text truncate">{t.title}</p>
                  <p className="text-xs text-ix-muted">Due: {t.deadline || 'No deadline'}</p>
                </div>
                <span className={`text-[10px] font-mono px-2 py-1 rounded-lg font-medium
                  ${t.priority === 'high'   ? 'text-red-400 bg-red-500/10'
                  : t.priority === 'medium' ? 'text-amber-400 bg-amber-500/10'
                                            : 'text-cyan-400 bg-cyan-500/10'}`}>
                  {t.priority?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard rank */}
      {myRank > 0 && (
        <div className="card flex items-center gap-4">
          <div className="text-3xl">
            {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : `#${myRank}`}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-ix-text">Your Leaderboard Rank</p>
            <p className="text-xs text-ix-muted">You are ranked #{myRank} out of {board?.length ?? '—'} contributors</p>
          </div>
          <Link to="/leaderboard" className="text-xs text-ix-accent hover:text-ix-accent2 transition-colors flex-shrink-0">
            View Leaderboard →
          </Link>
        </div>
      )}

      {/* Activity trend */}
      <div className="card">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-ix-text">Activity Trend</h3>
            <p className="text-xs text-ix-muted mt-0.5">6-week activity overview</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-[10px] font-mono text-ix-muted">Activity Score</span>
          </div>
        </div>
        <GradientAreaChart
          data={engageFallback}
          lines={[{ key: 'Engagement', label: 'Activity Score', color: '#6366f1' }]}
          height={160}
        />
      </div>

      {/* Personal AI insights */}
      <AIRecommendationsPanel context={personalContext} title="Your AI Insights" maxItems={2} />
    </div>
  )
}

export default function Dashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminDashboard /> : <ContributorDashboard />
}