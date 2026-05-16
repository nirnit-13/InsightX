import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import NotificationsPanel from '../notifications/NotificationsPanel'
import {
  RiDashboardLine, RiTeamLine, RiTaskLine, RiTrophyLine,
  RiFileChartLine, RiUserLine, RiMenuLine, RiCloseLine,
  RiLogoutBoxLine, RiFlashlightLine, RiSearchLine,
} from 'react-icons/ri'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/contributors', icon: RiTeamLine,      label: 'Contributors' },
  { to: '/tasks',        icon: RiTaskLine,      label: 'Tasks' },
  { to: '/leaderboard',  icon: RiTrophyLine,    label: 'Leaderboard' },
  { to: '/reports',      icon: RiFileChartLine, label: 'AI Reports' },
  { to: '/profile',      icon: RiUserLine,      label: 'Profile' },
]

function UserAvatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  return (
    <div className={`${sizes[size]} rounded-xl flex items-center justify-center font-display font-bold text-white`}
      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
      {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex flex-col h-full p-5">
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ix-accent to-ix-accent2 flex items-center justify-center shadow-glow-sm">
          <RiFlashlightLine className="text-white text-base" />
        </div>
        <span className="font-display font-bold text-ix-text text-lg tracking-tight">InsightX</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <p className="text-[10px] font-mono text-ix-muted uppercase tracking-widest px-3 mb-2">Navigation</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon className="text-lg flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 p-3 glass rounded-xl border border-ix-border">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-semibold text-ix-text truncate">{user?.name}</p>
            <p className="text-[10px] font-mono text-ix-muted capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ix-red/20 text-ix-muted hover:text-ix-red transition-all">
            <RiLogoutBoxLine className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ix-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-ix-surface border-r border-ix-border flex-shrink-0">
        <Sidebar onClose={() => {}} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-ix-surface border-r border-ix-border z-50 lg:hidden">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-ix-muted hover:text-ix-text">
                  <RiCloseLine />
                </button>
              </div>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-ix-border bg-ix-surface/80 backdrop-blur-md flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
            <RiMenuLine className="text-lg" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-ix-card/50 border border-ix-border rounded-xl px-3 py-2">
            <RiSearchLine className="text-ix-muted text-sm flex-shrink-0" />
            <input placeholder="Search contributors, tasks..."
              className="bg-transparent text-sm text-ix-muted placeholder-ix-muted/60 outline-none w-full font-body" />
            <kbd className="text-[10px] font-mono text-ix-muted/50 border border-ix-border px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* ← Notifications panel (replaces bare bell) */}
            <NotificationsPanel />
            <UserAvatar user={user} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}