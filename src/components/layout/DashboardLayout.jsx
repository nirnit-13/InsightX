/**
 * src/components/layout/DashboardLayout.jsx
 *
 * FIX: Corrected all import paths — this file lives in src/components/layout/
 *      so context and component imports need ../../ prefix, not ../.
 *
 * This is a thin layout wrapper used as an alternative canonical layout.
 * App.jsx uses AppLayout (same folder), which already had correct paths.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../sidebar/Sidebar'
import NotificationsPanel from '../notifications/NotificationsPanel'
import ThemeToggle from '../ui/ThemeToggle'
import { RiMenuLine, RiCloseLine, RiSearchLine } from 'react-icons/ri'

function UserAvatar({ user, size = 'sm' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-display font-bold text-white flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${user?.color || '#6366f1'}, #8b5cf6)` }}
    >
      {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function DashboardLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ix-bg flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsible />
      </aside>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              {/* Close button */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-ix-muted hover:text-ix-text"
                >
                  <RiCloseLine />
                </button>
              </div>
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-ix-border bg-ix-surface/80 backdrop-blur-md flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all"
          >
            <RiMenuLine className="text-lg" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-ix-card/50 border border-ix-border rounded-xl px-3 py-2">
            <RiSearchLine className="text-ix-muted text-sm flex-shrink-0" />
            <input
              placeholder="Search contributors, tasks…"
              className="bg-transparent text-sm text-ix-muted placeholder-ix-muted/60 outline-none w-full font-body"
            />
            <kbd className="text-[10px] font-mono text-ix-muted/50 border border-ix-border px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <NotificationsPanel />
            <UserAvatar user={user} />
          </div>
        </header>

        {/* Page output */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}