import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../context/NotificationsContext'
import {
  RiBellLine, RiCloseLine, RiCheckDoubleLine,
  RiAlarmWarningLine, RiTrophyLine, RiInformationLine,
  RiErrorWarningLine,
} from 'react-icons/ri'
import { formatDistanceToNow } from 'date-fns'

const SEVERITY_STYLES = {
  critical: { border: 'border-l-ix-red',   dot: 'bg-ix-red',   bg: 'hover:bg-ix-red/5' },
  warning:  { border: 'border-l-ix-amber', dot: 'bg-ix-amber', bg: 'hover:bg-ix-amber/5' },
  positive: { border: 'border-l-ix-green', dot: 'bg-ix-green', bg: 'hover:bg-ix-green/5' },
  info:     { border: 'border-l-ix-cyan',  dot: 'bg-ix-cyan',  bg: 'hover:bg-ix-cyan/5' },
}

function timeAgo(ts) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true })
  } catch {
    return 'recently'
  }
}

export default function NotificationsPanel() {
  const {
    notifications, unreadCount, panelOpen, setPanelOpen,
    markRead, markAllRead, dismiss,
  } = useNotifications()

  const panelRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [panelOpen, setPanelOpen])

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setPanelOpen(p => !p)}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all relative">
        <RiBellLine className="text-lg" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-ix-red rounded-full
                         text-[9px] font-mono font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-1.5rem)]
                       glass border border-ix-border rounded-2xl shadow-card z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ix-border">
              <div className="flex items-center gap-2">
                <RiBellLine className="text-ix-accent" />
                <span className="font-display font-semibold text-sm text-ix-text">Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge bg-ix-accent/15 text-ix-accent border border-ix-accent/20 text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] font-mono text-ix-muted hover:text-ix-accent transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    <RiCheckDoubleLine /> Mark all read
                  </button>
                )}
                <button onClick={() => setPanelOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
                  <RiCloseLine className="text-sm" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-3xl mb-3">🔔</span>
                  <p className="font-display text-sm text-ix-text font-semibold">All caught up!</p>
                  <p className="text-xs text-ix-muted mt-1">No new notifications</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => {
                    const s = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => markRead(n.id)}
                        className={`flex gap-3 px-4 py-3 border-b border-ix-border/50 last:border-0
                                   border-l-2 cursor-pointer transition-all ${s.border} ${s.bg}
                                   ${n.read ? 'opacity-60' : ''}`}>
                        <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-display font-semibold ${n.read ? 'text-ix-muted' : 'text-ix-text'}`}>
                              {n.title}
                            </p>
                            <button
                              onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                              className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded text-ix-muted hover:text-ix-text transition-colors opacity-0 group-hover:opacity-100">
                              <RiCloseLine className="text-xs" />
                            </button>
                          </div>
                          <p className="text-[11px] text-ix-muted leading-relaxed mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-ix-muted/60 font-mono mt-1">{timeAgo(n.timestamp)}</p>
                        </div>
                        {!n.read && (
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${s.dot}`} />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-ix-border text-center">
                <p className="text-[10px] font-mono text-ix-muted">
                  {notifications.length} total · {unreadCount} unread
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}