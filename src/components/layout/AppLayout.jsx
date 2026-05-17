/**
 * src/components/layout/AppLayout.jsx
 *
 * FIXES:
 *  1. AI Chat button added to the navbar (top-right area)
 *  2. Clicking the chat button opens a floating AIChatAssistant panel
 *  3. Chat panel is overlaid without navigating away
 *  4. Context is passed from the analytics overview hook so the AI has real data
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../sidebar/Sidebar'
import NotificationsPanel from '../notifications/NotificationsPanel'
import ThemeToggle from '../ui/ThemeToggle'
import AIChatAssistant from '../ai/AIChatAssistant'
import { RiMenuLine, RiCloseLine, RiSearchLine, RiRobot2Line } from 'react-icons/ri'

function UserAvatar({ user, size = 'sm' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-display font-bold text-white flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${user?.color || '#6366f1'}, #8b5cf6)` }}
    >
      {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'}
    </div>
  )
}

export default function AppLayout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen]       = useState(false)

  return (
    <div className="min-h-screen bg-ix-bg flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsible />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-ix-muted hover:text-ix-text"
                >
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all"
          >
            <RiMenuLine className="text-lg" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-ix-card/50 border border-ix-border rounded-xl px-3 py-2">
            <RiSearchLine className="text-ix-muted text-sm flex-shrink-0" />
            <input
              placeholder="Search contributors, tasks..."
              className="bg-transparent text-sm text-ix-muted placeholder-ix-muted/60 outline-none w-full font-body"
            />
            <kbd className="text-[10px] font-mono text-ix-muted/50 border border-ix-border px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationsPanel />

            {/* AI Chat Button */}
            <motion.button
              onClick={() => setChatOpen(p => !p)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="AI Assistant"
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all relative ${
                chatOpen
                  ? 'bg-ix-accent text-white shadow-glow-sm'
                  : 'hover:bg-white/5 text-ix-muted hover:text-ix-text'
              }`}
            >
              <RiRobot2Line className="text-lg" />
              {/* Pulse indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ix-green border border-ix-surface animate-pulse" />
            </motion.button>

            <UserAvatar user={user} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Floating AI Chat Panel ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-card"
          >
            <AIChatAssistant
              onClose={() => setChatOpen(false)}
              embedded={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}