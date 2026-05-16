import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { RiSparklingLine, RiRefreshLine } from 'react-icons/ri'

const SEVERITY_CONFIG = {
  positive: {
    border: 'border-ix-green/20',
    bg: 'bg-ix-green/5',
    dot: 'bg-ix-green',
    badge: 'text-ix-green bg-ix-green/10',
  },
  warning: {
    border: 'border-ix-amber/20',
    bg: 'bg-ix-amber/5',
    dot: 'bg-ix-amber',
    badge: 'text-ix-amber bg-ix-amber/10',
  },
  info: {
    border: 'border-ix-cyan/20',
    bg: 'bg-ix-cyan/5',
    dot: 'bg-ix-cyan',
    badge: 'text-ix-cyan bg-ix-cyan/10',
  },
  critical: {
    border: 'border-ix-red/20',
    bg: 'bg-ix-red/5',
    dot: 'bg-ix-red',
    badge: 'text-ix-red bg-ix-red/10',
  },
}

export default function AIInsightCard({
  insight,
  index = 0,
  onRefresh,
  loading = false,
  compact = false,
}) {
  const s = SEVERITY_CONFIG[insight?.severity] || SEVERITY_CONFIG.info

  if (loading) {
    return (
      <div className={clsx('p-4 rounded-xl border border-ix-border animate-pulse', compact ? '' : 'space-y-2')}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 shimmer-bg rounded" />
          <div className="h-3 shimmer-bg rounded w-40" />
        </div>
        <div className="h-3 shimmer-bg rounded w-full" />
        <div className="h-3 shimmer-bg rounded w-3/4" />
      </div>
    )
  }

  if (!insight) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={clsx('p-4 rounded-xl border relative group', s.border, s.bg)}>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg glass border border-ix-border text-ix-muted hover:text-ix-accent transition-all opacity-0 group-hover:opacity-100">
          <RiRefreshLine className="text-xs" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{insight.icon || '✦'}</span>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)} />
            <h4 className="text-sm font-display font-semibold text-ix-text">
              {insight.title || insight.headline}
            </h4>
            <span className={clsx('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase', s.badge)}>
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-ix-muted leading-relaxed">{insight.summary}</p>
          {insight.recommendation && (
            <p className="text-xs text-ix-accent mt-2 font-medium flex items-center gap-1">
              <RiSparklingLine className="text-xs flex-shrink-0" />
              {insight.recommendation}
            </p>
          )}
          {insight.timestamp && !compact && (
            <p className="text-[10px] font-mono text-ix-muted/50 mt-2">
              {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}