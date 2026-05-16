import { useState } from 'react'
import { motion } from 'framer-motion'
import { CONTRIBUTORS } from '../data/mockData'
import { Avatar, ProgressBar, Badge } from '../components/ui/Components'
import { RiTrophyLine, RiFireLine, RiStarLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'

const SORT_OPTIONS = [
  { key: 'productivity_score', label: 'Productivity' },
  { key: 'completed_tasks', label: 'Tasks Done' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'streak', label: 'Streak' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const BADGE_LABELS = ['MVP', 'Rising Star', 'Consistent', 'Team Player', 'Focus Mode']

function getRankBadge(score) {
  if (score >= 90) return { label: 'Elite', color: '#f59e0b' }
  if (score >= 80) return { label: 'Senior', color: '#6366f1' }
  if (score >= 70) return { label: 'Mid', color: '#06b6d4' }
  return { label: 'Junior', color: '#64748b' }
}

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState('productivity_score')
  const [dir, setDir] = useState('desc')

  const sorted = [...CONTRIBUTORS].sort((a, b) =>
    dir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
  )

  const toggleDir = () => setDir(d => d === 'desc' ? 'asc' : 'desc')

  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ix-text flex items-center gap-3">
          <RiTrophyLine className="text-ix-amber" /> Leaderboard
        </h1>
        <p className="text-ix-muted text-sm mt-1">Ranked contributor performance — May 2025</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[top3[1], top3[0], top3[2]].map((c, podiumIdx) => {
          if (!c) return <div key={podiumIdx} />
          const rank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2
          const sizes = ['h-28', 'h-36', 'h-24']
          const heights = ['h-24', 'h-32', 'h-20']
          const isFirst = rank === 0
          const badge = getRankBadge(c.productivity_score)
          return (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rank * 0.1 + 0.2 }}
              className={`flex flex-col items-center ${isFirst ? 'order-2' : podiumIdx === 0 ? 'order-1' : 'order-3'}`}>
              <div className="relative mb-3">
                <Avatar initials={c.avatar} color={c.color} size={isFirst ? 'xl' : 'lg'} />
                <span className="absolute -bottom-1 -right-1 text-lg leading-none">{MEDALS[rank]}</span>
                {isFirst && (
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg">👑</motion.div>
                )}
              </div>
              <p className="font-display font-bold text-sm text-ix-text text-center">{c.name.split(' ')[0]}</p>
              <p className="text-[10px] text-ix-muted mb-2">{c.team}</p>
              <p className="text-xl font-display font-bold" style={{ color: c.color }}>{c[sortBy]}{sortBy === 'attendance' ? '%' : ''}</p>
              <p className="text-[10px] text-ix-muted capitalize mb-3">{SORT_OPTIONS.find(o => o.key === sortBy)?.label}</p>
              <div className={`w-full glass rounded-t-lg border border-ix-border/50 flex items-end justify-center pb-2 ${heights[rank]} relative overflow-hidden`}
                style={{ borderBottom: 'none' }}>
                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to top, ${c.color}, transparent)` }} />
                <span className="text-lg font-mono font-bold text-ix-muted z-10">#{rank + 1}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-xs text-ix-muted font-mono">Sort by:</span>
        {SORT_OPTIONS.map(o => (
          <button key={o.key} onClick={() => setSortBy(o.key)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              sortBy === o.key ? 'bg-ix-accent text-white' : 'glass border border-ix-border text-ix-muted hover:text-ix-text'
            }`}>
            {o.label}
          </button>
        ))}
        <button onClick={toggleDir}
          className="ml-auto w-8 h-8 flex items-center justify-center glass border border-ix-border rounded-xl text-ix-muted hover:text-ix-text transition-all">
          {dir === 'desc' ? <RiArrowDownLine /> : <RiArrowUpLine />}
        </button>
      </div>

      {/* Full Rankings Table */}
      <div className="glass rounded-2xl border border-ix-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-ix-border text-[10px] font-mono text-ix-muted uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Contributor</div>
          <div className="col-span-2 text-center hidden sm:block">Score</div>
          <div className="col-span-2 text-center hidden md:block">Tasks</div>
          <div className="col-span-2 text-center hidden lg:block">Streak</div>
          <div className="col-span-3 lg:col-span-1 text-center">Badge</div>
        </div>

        {sorted.map((c, i) => {
          const badge = getRankBadge(c.productivity_score)
          return (
            <motion.div key={c.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-ix-border/50 last:border-0 hover:bg-white/2 transition-all items-center">
              <div className="col-span-1">
                {i < 3 ? (
                  <span className="text-lg">{MEDALS[i]}</span>
                ) : (
                  <span className="text-sm font-mono text-ix-muted">#{i + 1}</span>
                )}
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <Avatar initials={c.avatar} color={c.color} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-display font-semibold text-ix-text truncate">{c.name}</p>
                  <p className="text-[10px] text-ix-muted">{c.team}</p>
                </div>
              </div>
              <div className="col-span-2 hidden sm:block">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-display font-bold" style={{ color: c.color }}>{c.productivity_score}</span>
                  <ProgressBar value={c.productivity_score} max={100} color={c.color} height={3} />
                </div>
              </div>
              <div className="col-span-2 text-center hidden md:block">
                <span className="text-sm font-mono text-ix-text">{c.completed_tasks}</span>
              </div>
              <div className="col-span-2 text-center hidden lg:block">
                <span className="text-xs text-ix-amber flex items-center justify-center gap-1">
                  <RiFireLine /> {c.streak}d
                </span>
              </div>
              <div className="col-span-3 lg:col-span-1 flex justify-center">
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg"
                  style={{ color: badge.color, backgroundColor: `${badge.color}15`, border: `1px solid ${badge.color}30` }}>
                  {badge.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}