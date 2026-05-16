import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TASKS, CONTRIBUTORS } from '../data/mockData'

const NotificationsContext = createContext(null)

// ── Generate notifications from data ──────────────────────────────────────
function buildNotifications() {
  const now = new Date()
  const notes = []

  // Deadline alerts — tasks due within 3 days
  TASKS.forEach(task => {
    if (task.status === 'completed') return
    const deadline = new Date(task.deadline)
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) {
      notes.push({
        id: `overdue-${task.id}`,
        type: 'deadline',
        severity: 'critical',
        icon: '🚨',
        title: 'Task Overdue',
        message: `"${task.title}" was due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`,
        timestamp: new Date(deadline).toISOString(),
        read: false,
        taskId: task.id,
      })
    } else if (daysLeft <= 2) {
      notes.push({
        id: `due-soon-${task.id}`,
        type: 'deadline',
        severity: 'warning',
        icon: '⏰',
        title: 'Deadline Approaching',
        message: `"${task.title}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        taskId: task.id,
      })
    }
  })

  // Achievement badges — contributors with high streaks
  CONTRIBUTORS.forEach(c => {
    if (c.streak >= 14) {
      notes.push({
        id: `streak-${c.id}`,
        type: 'achievement',
        severity: 'positive',
        icon: '🏆',
        title: 'Achievement Unlocked',
        message: `${c.name} hit a ${c.streak}-day contribution streak!`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        contributorId: c.id,
      })
    }
    if (c.productivity_score >= 90) {
      notes.push({
        id: `top-perf-${c.id}`,
        type: 'achievement',
        severity: 'positive',
        icon: '⭐',
        title: 'Top Performer',
        message: `${c.name} reached a ${c.productivity_score} productivity score this week`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        contributorId: c.id,
      })
    }
    if (c.attendance < 80) {
      notes.push({
        id: `attendance-${c.id}`,
        type: 'alert',
        severity: 'warning',
        icon: '📉',
        title: 'Low Attendance Alert',
        message: `${c.name}'s attendance dropped to ${c.attendance}% — below the 80% threshold`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: false,
        contributorId: c.id,
      })
    }
  })

  // Activity notification
  notes.push({
    id: 'weekly-report',
    type: 'info',
    severity: 'info',
    icon: '📊',
    title: 'Weekly Report Ready',
    message: 'Your AI-generated weekly analytics report is ready to view',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: false,
  })

  // Sort newest first
  return notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(buildNotifications)
  const [panelOpen, setPanelOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((note) => {
    setNotifications(prev => [
      { ...note, id: `manual-${Date.now()}`, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ])
  }, [])

  return (
    <NotificationsContext.Provider value={{
      notifications, unreadCount, panelOpen, setPanelOpen,
      markRead, markAllRead, dismiss, addNotification,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}