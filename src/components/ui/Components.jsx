import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// ── Stat Card ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, delta, icon: Icon, color = '#6366f1', prefix = '', suffix = '' }) {
  const isPositive = delta >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="stat-card">
      {/* Background glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="text-lg" style={{ color }} />
        </div>
        {delta !== undefined && (
          <span className={clsx('text-xs font-mono font-medium px-2 py-1 rounded-full',
            isPositive ? 'text-ix-green bg-ix-green/10' : 'text-ix-red bg-ix-red/10')}>
            {isPositive ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-ix-text mb-1">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="text-xs text-ix-muted font-body">{label}</p>
    </motion.div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ label, variant = 'default' }) {
  const variants = {
    default: 'bg-ix-border text-ix-muted',
    success: 'bg-ix-green/15 text-ix-green border border-ix-green/20',
    warning: 'bg-ix-amber/15 text-ix-amber border border-ix-amber/20',
    danger: 'bg-ix-red/15 text-ix-red border border-ix-red/20',
    info: 'bg-ix-cyan/15 text-ix-cyan border border-ix-cyan/20',
    accent: 'bg-ix-accent/15 text-ix-accent border border-ix-accent/20',
  }
  return (
    <span className={clsx('badge', variants[variant])}>{label}</span>
  )
}

// ── Priority Badge ─────────────────────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = { high: 'danger', medium: 'warning', low: 'info' }
  return <Badge label={priority.toUpperCase()} variant={map[priority] || 'default'} />
}

// ── Status Badge ───────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    completed: { variant: 'success', label: 'Completed' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    pending: { variant: 'warning', label: 'Pending' },
  }
  const { variant, label } = map[status] || { variant: 'default', label: status }
  return <Badge label={label} variant={variant} />
}

// ── Progress Bar ───────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#6366f1', height = 6, animate: shouldAnimate = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        initial={shouldAnimate ? { width: 0 } : { width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
      />
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({ initials, color = '#6366f1', size = 'md' }) {
  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  }
  return (
    <div className={clsx('rounded-xl flex items-center justify-center font-display font-bold text-white flex-shrink-0', sizes[size])}
      style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}>
      {initials}
    </div>
  )
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={clsx('shimmer-bg rounded-xl', className)} />
}

// ── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-ix-card border border-ix-border flex items-center justify-center mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-ix-text mb-2">{title}</h3>
      <p className="text-sm text-ix-muted mb-6 max-w-xs">{subtitle}</p>
      {action}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-ix-text">{title}</h2>
        {subtitle && <p className="text-sm text-ix-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Loading Spinner ────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx('border-2 border-ix-accent border-t-transparent rounded-full animate-spin', sizes[size])} />
  )
}

// ── Insight Card ───────────────────────────────────────────────────────────
export function InsightCard({ insight, index = 0 }) {
  const severityMap = {
    positive: { border: 'border-ix-green/20', bg: 'bg-ix-green/5', dot: 'bg-ix-green' },
    warning: { border: 'border-ix-amber/20', bg: 'bg-ix-amber/5', dot: 'bg-ix-amber' },
    info: { border: 'border-ix-cyan/20', bg: 'bg-ix-cyan/5', dot: 'bg-ix-cyan' },
    critical: { border: 'border-ix-red/20', bg: 'bg-ix-red/5', dot: 'bg-ix-red' },
  }
  const s = severityMap[insight.severity] || severityMap.info
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={clsx('p-4 rounded-xl border', s.border, s.bg)}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{insight.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
            <h4 className="text-sm font-display font-semibold text-ix-text">{insight.title || insight.headline}</h4>
          </div>
          <p className="text-xs text-ix-muted leading-relaxed">{insight.summary}</p>
          {insight.recommendation && (
            <p className="text-xs text-ix-accent mt-2 font-medium">→ {insight.recommendation}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}