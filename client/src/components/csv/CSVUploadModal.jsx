import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import {
  RiUploadCloud2Line, RiCloseLine, RiCheckLine,
  RiErrorWarningLine, RiDownloadLine, RiFileLine,
  RiDeleteBinLine,
} from 'react-icons/ri'

// ── CSV templates for download ─────────────────────────────────────────────
const TEMPLATES = {
  contributors: {
    headers: ['name', 'email', 'team', 'role', 'skills', 'github', 'linkedin', 'attendance', 'productivity_score'],
    sample: [
      ['Jane Doe', 'jane@company.com', 'Frontend', 'contributor', 'React,TypeScript', 'janedoe', 'jane-doe', '95', '88'],
      ['John Smith', 'john@company.com', 'Backend', 'contributor', 'Python,FastAPI', 'johnsmith', 'john-smith', '90', '82'],
    ],
  },
  tasks: {
    headers: ['title', 'description', 'priority', 'status', 'team', 'deadline', 'tags'],
    sample: [
      ['Build auth module', 'Implement JWT authentication', 'high', 'pending', 'Backend', '2025-06-01', 'Auth,Security'],
      ['Design homepage', 'Create new landing page mockups', 'medium', 'in-progress', 'Design', '2025-06-10', 'UI,Figma'],
    ],
  },
}

function downloadTemplate(type) {
  const t = TEMPLATES[type]
  const rows = [t.headers, ...t.sample]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `insightx-${type}-template.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function validateRow(row, type) {
  if (type === 'contributors') {
    if (!row.name || !row.email) return 'Missing required fields: name, email'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return 'Invalid email format'
  }
  if (type === 'tasks') {
    if (!row.title) return 'Missing required field: title'
    if (row.priority && !['high', 'medium', 'low'].includes(row.priority)) return 'Priority must be high, medium, or low'
    if (row.status && !['pending', 'in-progress', 'completed'].includes(row.status)) return 'Invalid status value'
  }
  return null
}

export default function CSVUploadModal({ type = 'contributors', onClose, onImport }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])
  const [step, setStep] = useState('upload') // upload | preview | done
  const [importing, setImporting] = useState(false)
  const inputRef = useRef(null)

  const processFile = useCallback((f) => {
    if (!f || !f.name.endsWith('.csv')) {
      setErrors(['Please upload a valid .csv file'])
      return
    }
    setFile(f)
    setErrors([])

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rowErrors = []
        results.data.forEach((row, i) => {
          const err = validateRow(row, type)
          if (err) rowErrors.push(`Row ${i + 2}: ${err}`)
        })
        setErrors(rowErrors)
        setPreview(results.data.slice(0, 8)) // show first 8 rows
        setStep('preview')
      },
      error: (err) => {
        setErrors([`Parse error: ${err.message}`])
      },
    })
  }, [type])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const handleImport = async () => {
    setImporting(true)
    await new Promise(r => setTimeout(r, 800))

    // Parse full file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const clean = results.data.map(row => {
          if (type === 'contributors') {
            return {
              ...row,
              id: String(Date.now() + Math.random()),
              skills: row.skills ? row.skills.split(',').map(s => s.trim()) : [],
              tags: row.tags ? row.tags.split(',').map(s => s.trim()) : [],
              avatar: (row.name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
              color: ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b'][Math.floor(Math.random() * 5)],
              attendance: parseFloat(row.attendance) || 90,
              productivity_score: parseFloat(row.productivity_score) || 75,
              completed_tasks: 0,
              streak: 0,
            }
          }
          // tasks
          return {
            ...row,
            id: `t${Date.now() + Math.random()}`,
            tags: row.tags ? row.tags.split(',').map(s => s.trim()) : [],
            created_at: new Date().toISOString(),
            status: row.status || 'pending',
            priority: row.priority || 'medium',
          }
        })
        onImport(clean)
        setImporting(false)
        setStep('done')
      },
    })
  }

  const typeLabel = type === 'contributors' ? 'Contributors' : 'Tasks'
  const cols = type === 'contributors'
    ? ['name', 'email', 'team', 'skills', 'attendance']
    : ['title', 'priority', 'status', 'team', 'deadline']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="glass border border-ix-border rounded-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ix-border">
          <div>
            <h2 className="font-display font-semibold text-ix-text">Import {typeLabel}</h2>
            <p className="text-xs text-ix-muted mt-0.5">Upload a CSV file to bulk import</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadTemplate(type)}
              className="flex items-center gap-1.5 text-xs text-ix-accent hover:text-ix-accent2 transition-colors px-3 py-1.5 glass rounded-lg border border-ix-accent/20">
              <RiDownloadLine /> Template
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
              <RiCloseLine />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-ix-accent bg-ix-accent/10 scale-[1.01]'
                  : 'border-ix-border hover:border-ix-accent/50 hover:bg-white/2'
              }`}>
              <input ref={inputRef} type="file" accept=".csv" className="hidden"
                onChange={e => e.target.files[0] && processFile(e.target.files[0])} />
              <RiUploadCloud2Line className={`text-5xl mx-auto mb-4 transition-colors ${dragOver ? 'text-ix-accent' : 'text-ix-muted'}`} />
              <p className="font-display font-semibold text-ix-text mb-1">
                {dragOver ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
              </p>
              <p className="text-sm text-ix-muted mb-4">or click to browse</p>
              <p className="text-xs font-mono text-ix-muted/60">
                Required columns: {TEMPLATES[type].headers.slice(0, 3).join(', ')}...
              </p>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div>
              {/* File info */}
              <div className="flex items-center gap-3 p-3 glass rounded-xl border border-ix-border mb-4">
                <RiFileLine className="text-ix-accent text-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ix-text truncate">{file?.name}</p>
                  <p className="text-xs text-ix-muted">{preview.length}+ rows detected</p>
                </div>
                <button onClick={() => { setStep('upload'); setFile(null); setPreview([]); setErrors([]) }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ix-red/20 text-ix-muted hover:text-ix-red transition-all">
                  <RiDeleteBinLine className="text-sm" />
                </button>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-3 glass rounded-xl border border-ix-red/20 bg-ix-red/5 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RiErrorWarningLine className="text-ix-red" />
                    <span className="text-xs font-display font-semibold text-ix-red">{errors.length} validation error{errors.length !== 1 ? 's' : ''}</span>
                  </div>
                  {errors.slice(0, 3).map((e, i) => (
                    <p key={i} className="text-xs text-ix-muted ml-5">{e}</p>
                  ))}
                  {errors.length > 3 && <p className="text-xs text-ix-muted ml-5">...and {errors.length - 3} more</p>}
                </div>
              )}

              {/* Preview table */}
              <div className="rounded-xl border border-ix-border overflow-hidden mb-4">
                <div className="overflow-x-auto max-h-52 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-ix-border bg-ix-surface/80">
                        {cols.map(col => (
                          <th key={col} className="px-3 py-2.5 text-left font-mono text-ix-muted uppercase tracking-wide text-[10px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b border-ix-border/50 last:border-0 hover:bg-white/2">
                          {cols.map(col => (
                            <td key={col} className="px-3 py-2 text-ix-text truncate max-w-[120px]">
                              {row[col] || <span className="text-ix-muted/40">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-ix-muted mb-4">
                Showing first {Math.min(preview.length, 8)} rows preview
                {errors.length > 0 ? ' · Rows with errors will be skipped' : ' · All rows look valid ✓'}
              </p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-ix-green/15 border border-ix-green/20 flex items-center justify-center mb-4">
                <RiCheckLine className="text-3xl text-ix-green" />
              </div>
              <h3 className="font-display font-bold text-xl text-ix-text mb-2">Import Successful!</h3>
              <p className="text-sm text-ix-muted">
                Your {typeLabel.toLowerCase()} have been imported successfully.
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer buttons */}
        {step !== 'done' && (
          <div className="flex gap-3 px-6 pb-5">
            <button onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
            {step === 'preview' && (
              <button onClick={handleImport} disabled={importing || (errors.length > 0 && preview.length === 0)}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {importing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
                ) : (
                  <><RiUploadCloud2Line /> Import {preview.length} rows</>
                )}
              </button>
            )}
          </div>
        )}
        {step === 'done' && (
          <div className="px-6 pb-5">
            <button onClick={onClose} className="btn-primary w-full py-2.5 text-sm">Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}