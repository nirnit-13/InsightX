import { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONTRIBUTORS } from '../data/mockData'
import { Avatar, Badge, ProgressBar } from '../components/ui/Components'
import CSVUploadModal from '../components/csv/CSVUploadModal'
import { exportContributorsCSV } from '../utils/exportUtils'
import {
  RiAddLine, RiSearchLine, RiGithubLine, RiLinkedinBoxLine,
  RiEditLine, RiDeleteBinLine, RiFilterLine, RiCloseLine,
  RiUploadCloud2Line, RiDownloadLine,
} from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'

const TEAMS = ['All', 'Frontend', 'Backend', 'Design', 'DevOps', 'Analytics']

/**
 * FIX: Wrapped with React.forwardRef so framer-motion's AnimatePresence /
 * PopChild can attach its ref without the console warning:
 * "Function components cannot be given refs."
 */
const ContributorCard = forwardRef(function ContributorCard(
  { contributor, onEdit, onDelete, isAdmin },
  ref
) {
  const c = contributor
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      className="card group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar initials={c.avatar} color={c.color} size="lg" />
          <div>
            <h3 className="font-display font-semibold text-ix-text">{c.name}</h3>
            <p className="text-xs text-ix-muted">{c.email}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(c)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ix-accent/20 text-ix-muted hover:text-ix-accent transition-all">
              <RiEditLine className="text-sm" />
            </button>
            <button onClick={() => onDelete(c.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ix-red/20 text-ix-muted hover:text-ix-red transition-all">
              <RiDeleteBinLine className="text-sm" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge label={c.team} variant="accent" />
        <Badge label={c.role} variant={c.role === 'admin' ? 'warning' : 'default'} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(Array.isArray(c.skills) ? c.skills : []).map(s => (
          <span key={s}
            className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-ix-muted rounded border border-ix-border">
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Productivity', value: `${c.productivity_score}`, color: c.color },
          { label: 'Attendance',   value: `${c.attendance}%`,        color: '#10b981' },
          { label: 'Tasks Done',   value: c.completed_tasks,         color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} className="text-center p-2 bg-white/3 rounded-lg">
            <p className="font-display font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-ix-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-ix-muted mb-1.5">
          <span>Productivity Score</span><span>{c.productivity_score}/100</span>
        </div>
        <ProgressBar value={c.productivity_score} max={100} color={c.color} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-ix-amber">
          <span>🔥</span>
          <span className="font-mono font-medium">{c.streak}d streak</span>
        </div>
        <div className="flex items-center gap-2">
          {c.github && (
            <a href={`https://github.com/${c.github}`} target="_blank" rel="noreferrer"
              className="text-ix-muted hover:text-ix-text transition-colors">
              <RiGithubLine className="text-base" />
            </a>
          )}
          {c.linkedin && (
            <a href={`https://linkedin.com/in/${c.linkedin}`} target="_blank" rel="noreferrer"
              className="text-ix-muted hover:text-ix-cyan transition-colors">
              <RiLinkedinBoxLine className="text-base" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
})

function AddEditModal({ contributor, onClose, onSave }) {
  const isEdit = !!contributor?.id
  const [form, setForm] = useState(contributor || {
    name: '', email: '', team: 'Frontend', role: 'contributor',
    skills: '', github: '', linkedin: '', attendance: 90, productivity_score: 75,
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    const skills = typeof form.skills === 'string'
      ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
      : form.skills
    onSave({
      ...form, skills,
      avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: '#6366f1', streak: form.streak || 0,
      completed_tasks: form.completed_tasks || 0,
      id: form.id || String(Date.now()),
    })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="glass border border-ix-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-ix-text">
            {isEdit ? 'Edit Contributor' : 'Add Contributor'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
            <RiCloseLine />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'FULL NAME',                key: 'name',     placeholder: 'Alex Rivera' },
            { label: 'EMAIL',                    key: 'email',    placeholder: 'alex@company.com' },
            { label: 'GITHUB USERNAME',          key: 'github',   placeholder: 'alexrivera' },
            { label: 'LINKEDIN USERNAME',        key: 'linkedin', placeholder: 'alex-rivera' },
            { label: 'SKILLS (comma-separated)', key: 'skills',   placeholder: 'React, Node.js, Python' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">{f.label}</label>
              <input className="input text-sm" placeholder={f.placeholder}
                value={typeof form[f.key] === 'string' ? form[f.key] : (form[f.key] || []).join(', ')}
                onChange={set(f.key)} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">TEAM</label>
              <select className="input text-sm" value={form.team} onChange={set('team')}>
                {TEAMS.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-ix-muted mb-1.5">ROLE</label>
              <select className="input text-sm" value={form.role} onChange={set('role')}>
                <option value="contributor">Contributor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 py-2.5 text-sm">
            {isEdit ? 'Save Changes' : 'Add Contributor'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Contributors() {
  const { isAdmin } = useAuth()
  const [contributors, setContributors] = useState(CONTRIBUTORS)
  const [search, setSearch]         = useState('')
  const [teamFilter, setTeamFilter] = useState('All')
  const [modal, setModal]           = useState(null)   // null | 'add' | contributor-object
  const [showCSV, setShowCSV]       = useState(false)

  const filtered = contributors.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchTeam = teamFilter === 'All' || c.team === teamFilter
    return matchSearch && matchTeam
  })

  const handleSave = (data) => {
    if (data.id && contributors.find(c => c.id === data.id))
      setContributors(prev => prev.map(c => c.id === data.id ? data : c))
    else
      setContributors(prev => [...prev, data])
  }

  const handleCSVImport = (rows) => {
    setContributors(prev => [...prev, ...rows])
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-text">Contributors</h1>
          <p className="text-ix-muted text-sm mt-1">
            {contributors.length} total · {filtered.length} shown
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={exportContributorsCSV}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5">
              <RiDownloadLine /> Export CSV
            </button>
            <button onClick={() => setShowCSV(true)}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5">
              <RiUploadCloud2Line /> Import CSV
            </button>
            <button onClick={() => setModal('add')}
              className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
              <RiAddLine /> Add
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input pl-10 text-sm" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RiFilterLine className="text-ix-muted text-sm" />
          {TEAMS.map(t => (
            <button key={t} onClick={() => setTeamFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                teamFilter === t
                  ? 'bg-ix-accent text-white'
                  : 'glass border border-ix-border text-ix-muted hover:text-ix-text hover:border-ix-accent/30'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map(c => (
            <ContributorCard
              key={c.id}
              contributor={c}
              isAdmin={isAdmin}
              onEdit={c => setModal(c)}
              onDelete={id => setContributors(prev => prev.filter(c => c.id !== id))}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-display text-ix-text font-semibold">No contributors found</p>
          <p className="text-sm text-ix-muted mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <AddEditModal contributor={modal === 'add' ? null : modal}
            onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {showCSV && (
          <CSVUploadModal type="contributors"
            onClose={() => setShowCSV(false)} onImport={handleCSVImport} />
        )}
      </AnimatePresence>
    </div>
  )
}