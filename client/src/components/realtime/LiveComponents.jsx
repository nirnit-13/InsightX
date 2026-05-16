import { motion, AnimatePresence } from 'framer-motion'
import { RiRadioButtonLine, RiPauseLine, RiPlayLine, RiRefreshLine } from 'react-icons/ri'
import { useActivityFeed } from '../../hooks/useRealTime'
import { formatDistanceToNow } from 'date-fns'

// ── Live Status Indicator (for topbar / dashboard header) ─────────────────
export function LiveIndicator({ isLive, pulseActive, onToggle, onRefresh, lastPulse }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={pulseActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
          isLive
            ? 'border-ix-green/30 bg-ix-green/10 text-ix-green'
            : 'border-ix-border bg-ix-border/30 text-ix-muted'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-ix-green animate-pulse' : 'bg-ix-muted'}`} />
        {isLive ? 'LIVE' : 'PAUSED'}
      </motion.div>

      <button onClick={onToggle}
        className="w-7 h-7 flex items-center justify-center rounded-lg glass border border-ix-border text-ix-muted hover:text-ix-text transition-all hover:border-ix-accent/30">
        {isLive ? <RiPauseLine className="text-sm" /> : <RiPlayLine className="text-sm" />}
      </button>

      <button onClick={onRefresh}
        className="w-7 h-7 flex items-center justify-center rounded-lg glass border border-ix-border text-ix-muted hover:text-ix-text transition-all hover:border-ix-accent/30">
        <RiRefreshLine className="text-sm" />
      </button>

      {lastPulse && (
        <span className="text-[10px] font-mono text-ix-muted hidden sm:block">
          Updated {formatDistanceToNow(lastPulse, { addSuffix: true })}
        </span>
      )}
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────────────────────
export function ActivityFeed({ maxItems = 6 }) {
  const feed = useActivityFeed(maxItems)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold text-ix-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ix-green animate-pulse" />
            Live Activity
          </h3>
          <p className="text-xs text-ix-muted mt-0.5">Real-time contributor events</p>
        </div>
        <span className="badge bg-ix-green/10 text-ix-green border border-ix-green/20 text-[10px]">
          LIVE
        </span>
      </div>

      <div className="space-y-1 max-h-72 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-all">
              <span className="text-base flex-shrink-0 mt-0.5">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ix-text">
                  <span className="font-display font-semibold">{event.actor}</span>
                  {' '}
                  <span className="text-ix-muted">{event.action}</span>
                </p>
                <p className="text-[10px] font-mono text-ix-muted/60 mt-0.5">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-ix-accent/60 flex-shrink-0 mt-1.5" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Live Stat Badge (used on stat cards to show delta animation) ──────────
export function LiveStatBadge({ value, prevValue }) {
  if (prevValue === undefined || value === prevValue) return null
  const up = value > prevValue
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: up ? 8 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`text-[10px] font-mono font-bold ${up ? 'text-ix-green' : 'text-ix-red'}`}>
      {up ? '↑' : '↓'}
    </motion.span>
  )
}