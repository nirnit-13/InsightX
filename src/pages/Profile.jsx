import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { CONTRIBUTORS, TASKS } from '../data/mockData'
import { Avatar, ProgressBar, Badge, StatusBadge, PriorityBadge } from '../components/ui/Components'
import { GradientAreaChart } from '../components/charts/Charts'
import {
  RiEditLine, RiGithubLine, RiLinkedinBoxLine, RiSaveLine,
  RiCloseLine, RiFireLine, RiCheckboxCircleLine, RiTimeLine,
  RiCalendarCheckLine, RiMedalLine
} from 'react-icons/ri'

const ACTIVITY_SPARKLINE = [
  { name: 'W1', activity: 12 }, { name: 'W2', activity: 18 }, { name: 'W3', activity: 9 },
  { name: 'W4', activity: 24 }, { name: 'W5', activity: 20 }, { name: 'W6', activity: 28 },
]

const ACHIEVEMENTS = [
  { icon: '🏆', label: '30-Day Streak', earned: true },
  { icon: '⚡', label: 'Speed Demon', earned: true },
  { icon: '🎯', label: '100% Attendance', earned: false },
  { icon: '🌟', label: 'Top Performer', earned: true },
  { icon: '🤝', label: 'Team Player', earned: false },
  { icon: '🚀', label: 'First Commit', earned: true },
]

export default function Profile() {
  const { user } = useAuth()
  const contributor = CONTRIBUTORS.find(c => c.email === user?.email) || CONTRIBUTORS[0]
  const myTasks = TASKS.filter(t => t.assigned_to === contributor.id)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: contributor.name,
    github: contributor.github,
    linkedin: contributor.linkedin,
    skills: contributor.skills.join(', '),
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const taskStats = {
    completed: myTasks.filter(t => t.status === 'completed').length,
    inProgress: myTasks.filter(t => t.status === 'in-progress').length,
    pending: myTasks.filter(t => t.status === 'pending').length,
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ix-text">My Profile</h1>
        <p className="text-ix-muted text-sm mt-1">Your contributor identity & performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-1 space-y-5">
          {/* Identity Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card relative overflow-hidden">
            {/* Glow BG */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20"
              style={{ backgroundColor: contributor.color }} />

            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div className="relative mb-4">
                <Avatar initials={contributor.avatar} color={contributor.color} size="xl" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-ix-green border-2 border-ix-card" />
              </div>
              {editing ? (
                <div className="w-full space-y-3">
                  {[
                    { label: 'Full Name', key: 'name' },
                    { label: 'GitHub', key: 'github' },
                    { label: 'LinkedIn', key: 'linkedin' },
                  ].map(f => (
                    <div key={f.key} className="text-left">
                      <label className="text-[10px] font-mono text-ix-muted">{f.label.toUpperCase()}</label>
                      <input className="input text-sm mt-1" value={form[f.key]} onChange={set(f.key)} />
                    </div>
                  ))}
                  <div className="text-left">
                    <label className="text-[10px] font-mono text-ix-muted">SKILLS</label>
                    <input className="input text-sm mt-1" value={form.skills} onChange={set('skills')} placeholder="React, Python, ..." />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditing(false)} className="btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1">
                      <RiCloseLine /> Cancel
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                      <RiSaveLine /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-lg text-ix-text">{contributor.name}</h2>
                  <p className="text-xs text-ix-muted mb-1">{contributor.email}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge label={contributor.team} variant="accent" />
                    <Badge label={contributor.role} variant={contributor.role === 'admin' ? 'warning' : 'default'} />
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 mb-4">
                    {contributor.github && (
                      <a href={`https://github.com/${contributor.github}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-ix-muted hover:text-ix-text transition-colors">
                        <RiGithubLine className="text-base" /> @{contributor.github}
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {contributor.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-ix-muted rounded border border-ix-border">{s}</span>
                    ))}
                  </div>

                  <button onClick={() => setEditing(true)}
                    className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-2">
                    <RiEditLine /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card space-y-4">
            <h3 className="font-display font-semibold text-ix-text text-sm">Performance Metrics</h3>
            {[
              { label: 'Productivity Score', value: contributor.productivity_score, max: 100, color: contributor.color, suffix: '' },
              { label: 'Attendance Rate', value: contributor.attendance, max: 100, color: '#10b981', suffix: '%' },
              { label: 'Tasks Completed', value: contributor.completed_tasks, max: 40, color: '#06b6d4', suffix: '' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ix-muted">{m.label}</span>
                  <span className="font-mono font-semibold" style={{ color: m.color }}>{m.value}{m.suffix}</span>
                </div>
                <ProgressBar value={m.value} max={m.max} color={m.color} height={5} />
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2">
              <RiFireLine className="text-ix-amber text-lg" />
              <span className="text-sm font-display font-semibold text-ix-text">{contributor.streak}-day streak</span>
              <span className="text-xs text-ix-muted">— keep it up!</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Activity + Tasks + Achievements */}
        <div className="lg:col-span-2 space-y-5">
          {/* Activity Graph */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-ix-text">Activity Overview</h3>
                <p className="text-xs text-ix-muted mt-0.5">6-week contribution activity</p>
              </div>
              <span className="badge bg-ix-green/10 text-ix-green border border-ix-green/20 text-[10px]">Active</span>
            </div>
            <GradientAreaChart
              data={ACTIVITY_SPARKLINE}
              lines={[{ key: 'activity', label: 'Activity', color: contributor.color }]}
              height={160}
            />
          </motion.div>

          {/* Task Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card">
            <h3 className="font-display font-semibold text-ix-text mb-5">My Tasks</h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Completed', value: taskStats.completed, color: '#10b981', icon: RiCheckboxCircleLine },
                { label: 'In Progress', value: taskStats.inProgress, color: '#06b6d4', icon: RiTimeLine },
                { label: 'Pending', value: taskStats.pending, color: '#f59e0b', icon: RiCalendarCheckLine },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-3 text-center">
                  <s.icon className="text-xl mx-auto mb-1.5" style={{ color: s.color }} />
                  <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-ix-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {myTasks.length === 0 ? (
                <p className="text-sm text-ix-muted text-center py-6">No tasks assigned yet</p>
              ) : myTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/3 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ix-text truncate">{t.title}</p>
                    <p className="text-xs text-ix-muted">{new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="card">
            <div className="flex items-center gap-2 mb-5">
              <RiMedalLine className="text-ix-amber text-lg" />
              <h3 className="font-display font-semibold text-ix-text">Achievements</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a, i) => (
                <motion.div key={i} whileHover={{ scale: a.earned ? 1.04 : 1 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all ${
                    a.earned
                      ? 'glass border border-ix-amber/20 bg-ix-amber/5'
                      : 'border border-dashed border-ix-border opacity-40'
                  }`}>
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[10px] font-mono text-ix-muted leading-tight">{a.label}</span>
                  {a.earned && <span className="text-[9px] text-ix-amber font-medium">Earned</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}