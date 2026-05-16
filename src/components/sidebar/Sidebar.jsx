import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  RiDashboardLine,
  RiTeamLine,
  RiTaskLine,
  RiTrophyLine,
  RiFileChartLine,
  RiUserLine,
  RiBarChartBoxLine,
  RiLogoutBoxLine,
  RiFlashlightLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiShieldUserLine,
  RiPulseLine,
} from 'react-icons/ri'

// ── Navigation config ─────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/dashboard',    icon: RiDashboardLine,   label: 'Dashboard',    badge: null },
  { to: '/contributors', icon: RiTeamLine,         label: 'Contributors', badge: null },
  { to: '/tasks',        icon: RiTaskLine,         label: 'Tasks',        badge: null },
  { to: '/analytics',   icon: RiBarChartBoxLine,   label: 'Analytics',    badge: null },
  { to: '/leaderboard',  icon: RiTrophyLine,       label: 'Leaderboard',  badge: null },
  { to: '/reports',      icon: RiFileChartLine,    label: 'AI Reports',   badge: 'AI' },
  { to: '/profile',      icon: RiUserLine,         label: 'Profile',      badge: null },
]

const CONTRIBUTOR_NAV = [
  { to: '/dashboard',   icon: RiPulseLine,     label: 'My Dashboard', badge: null },
  { to: '/tasks',       icon: RiTaskLine,      label: 'My Tasks',     badge: null },
  { to: '/leaderboard', icon: RiTrophyLine,    label: 'Leaderboard',  badge: null },
  { to: '/profile',     icon: RiUserLine,      label: 'Profile',      badge: null },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-display font-bold text-white flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${user?.color || '#6366f1'}, #8b5cf6)` }}
    >
      {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-body font-medium transition-all duration-200 group relative
         ${isActive
           ? 'bg-ix-accent/15 text-ix-text border border-ix-accent/25 shadow-glow-sm'
           : 'text-ix-muted hover:text-ix-text hover:bg-white/5 border border-transparent'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ix-accent rounded-r-full"
            />
          )}

          <item.icon
            className={`text-lg flex-shrink-0 transition-colors ${isActive ? 'text-ix-accent' : 'text-current'}`}
          />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm overflow-hidden whitespace-nowrap flex-1"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Badge */}
          {item.badge && !collapsed && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-ix-accent/20 text-ix-accent border border-ix-accent/30">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({ onClose, collapsible = false }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = isAdmin ? ADMIN_NAV : CONTRIBUTOR_NAV

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
    navigate('/')
  }

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-60'

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`flex flex-col h-full bg-ix-surface border-r border-ix-border overflow-hidden`}
    >
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ix-accent to-ix-accent2 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <RiFlashlightLine className="text-white text-base" />
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-ix-text text-lg tracking-tight whitespace-nowrap overflow-hidden"
            >
              InsightX
            </motion.span>
          )}
        </AnimatePresence>

        {/* Collapse toggle (desktop only) */}
        {collapsible && (
          <motion.button
            onClick={() => setCollapsed(p => !p)}
            className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all flex-shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <RiMenuUnfoldLine className="text-sm" />
            ) : (
              <RiMenuFoldLine className="text-sm" />
            )}
          </motion.button>
        )}
      </div>

      {/* Role label */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 mb-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-ix-border">
              <RiShieldUserLine
                className={`text-xs flex-shrink-0 ${isAdmin ? 'text-ix-amber' : 'text-ix-cyan'}`}
              />
              <p className="text-[10px] font-mono text-ix-muted">
                Signed in as{' '}
                <span className={`font-bold ${isAdmin ? 'text-ix-amber' : 'text-ix-cyan'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section label */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-mono text-ix-muted uppercase tracking-widest px-7 mb-1.5"
          >
            {isAdmin ? 'Admin Panel' : 'My Workspace'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-ix-border">
        <div className={`flex items-center gap-3 p-2.5 glass rounded-xl border border-ix-border ${collapsed ? 'justify-center' : ''}`}>
          <UserAvatar user={user} size="sm" />

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-display font-semibold text-ix-text truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] font-mono text-ix-muted truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ix-red/20 text-ix-muted hover:text-ix-red transition-all flex-shrink-0"
          >
            <RiLogoutBoxLine className="text-sm" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}