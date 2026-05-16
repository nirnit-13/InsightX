import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TASKS, CONTRIBUTORS } from '../data/mockData'
import { StatusBadge, PriorityBadge, Avatar } from '../components/ui/Components'
import { RiAddLine, RiSearchLine, RiCloseLine, RiCalendarLine, RiUserLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['all', 'pending', 'in-progress', 'completed']
const PRIORITIES = ['all', 'high', 'medium', 'low']

function getContributor(id) {
  return CONTRIBUTORS.find(c => c.id === id)
}

function TaskCard({ task, onStatusChange }) {
  const assignee = getContributor(task.assigned_to)
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed'

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-xl p-4 border border-ix-border hover:border-ix-accent/20 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm text-ix-text truncate">{task.title}</h3>
          <p className="text-xs text-ix-muted mt-1 leading-relaxed line-clamp-2">{task.description}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {task.tags?.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-ix-muted rounded border border-ix-border">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee && <Avatar initials={assignee.avatar} color={assignee.color} size="xs" />}
          <div>
            <p className="text-[10px] font-medium text-ix-text">{assignee?.name?.split(' ')[0] || 'Unassigned'}</p>
            <p className={`text-[10px] ${isOverdue ? 'text-ix-red' : 'text-ix-muted'} flex items-center gap-1`}>
              <RiCalendarLine className="text-[10px]" />
              {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {isOverdue && ' · Overdue'}
            </p>
          </div>
        </div>
        <select value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          className="text-[10px] font-mono bg-transparent border border-ix-border rounded-lg px-2 py-1 text-ix-muted cursor-pointer focus:outline-none focus:border-ix-accent/50 hover:border-ix-accent/30 transition-colors">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-3 pt-3 border-t border-ix-border/50">
        <StatusBadge status={task.status} />
      </div>
    </motion.div>
  )
}

function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', status: 'pending',
    assigned_to: '', deadline: '', tags: ''
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleAdd = () => {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    onAdd({ ...form, tags, id: `t${Date.now()}`, team: 'General', created_at: new Date().toISOString() })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="glass border border-ix-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-ix-text">New Task</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
            <RiCloseLine />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-ix-muted mb-1.5">TASK TITLE</label>
            <input className="input text-sm" placeholder="e.g. Redesign landing page" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-ix-muted mb-1.5">DESCRIPTION</label>
            <textarea className="input text-sm resize-none h-20" placeholder="Task details..." value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">PRIORITY</label>
              <select className="input text-sm" value={form.priority} onChange={set('priority')}>
                <option>high</option><option>medium</option><option>low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">ASSIGN TO</label>
              <select className="input text-sm" value={form.assigned_to} onChange={set('assigned_to')}>
                <option value="">Unassigned</option>
                {CONTRIBUTORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">DEADLINE</label>
              <input type="date" className="input text-sm" value={form.deadline} onChange={set('deadline')} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">TAGS (comma-sep)</label>
              <input className="input text-sm" placeholder="React, API" value={form.tags} onChange={set('tags')} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
          <button onClick={handleAdd} disabled={!form.title} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">Create Task</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Tasks() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState(TASKS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  const handleStatusChange = (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const handleAdd = (task) => setTasks(prev => [task, ...prev])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-text">Task Management</h1>
          <p className="text-ix-muted text-sm mt-1">{tasks.length} total tasks</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
            <RiAddLine /> New Task
          </button>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: counts.total, color: '#6366f1' },
          { label: 'Pending', value: counts.pending, color: '#f59e0b' },
          { label: 'In Progress', value: counts['in-progress'], color: '#06b6d4' },
          { label: 'Completed', value: counts.completed, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-ix-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." className="input pl-10 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-ix-accent text-white' : 'glass border border-ix-border text-ix-muted hover:text-ix-text'
              }`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium capitalize transition-all ${
                priorityFilter === p ? 'bg-ix-accent2 text-white' : 'glass border border-ix-border text-ix-muted hover:text-ix-text'
              }`}>
              {p === 'all' ? '⚡ Priority' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-display text-ix-text font-semibold">No tasks found</p>
          <p className="text-sm text-ix-muted mt-1">Adjust your filters or create a new task</p>
        </div>
      )}

      <AnimatePresence>
        {showModal && <AddTaskModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  )
}