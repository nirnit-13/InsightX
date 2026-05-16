import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { RiFlashlightLine, RiEyeLine, RiEyeOffLine, RiLockLine, RiMailLine } from 'react-icons/ri'

const DEMO_CREDS = [
  { label: 'Admin',       email: 'admin@insightx.io', password: 'admin123' },
  { label: 'Contributor', email: 'sam@insightx.io',   password: 'pass123'  },
]

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // FIX: login() is async — must be awaited so the token is saved to
    // localStorage before we check result.success or navigate away.
    // Without await, result was a Promise object, result.success was
    // undefined, and localStorage('ix_token') was never set — causing
    // every subsequent API call to go out without a Bearer header → 403.
    const result = await login(form.email, form.password)

    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const fillDemo = (cred) => {
    setForm({ email: cred.email, password: cred.password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 bg-grid opacity-100" />
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-ix-accent/8 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-ix-cyan/6 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ix-accent to-ix-accent2 flex items-center justify-center shadow-glow-sm">
              <RiFlashlightLine className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-ix-text">InsightX</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-ix-text mb-2">Welcome back</h1>
          <p className="text-ix-muted text-sm">Sign in to your analytics dashboard</p>
        </div>

        {/* Demo quick-fill */}
        <div className="glass rounded-2xl p-4 mb-4 border border-ix-border">
          <p className="text-xs text-ix-muted mb-3 font-mono">Quick demo access:</p>
          <div className="flex gap-2">
            {DEMO_CREDS.map(c => (
              <button key={c.label} onClick={() => fillDemo(c)}
                className="flex-1 py-2 rounded-xl text-xs font-display font-semibold border border-ix-border
                           text-ix-muted hover:border-ix-accent hover:text-ix-accent hover:bg-ix-accent/10 transition-all">
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-7 border border-ix-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">PASSWORD</label>
              <div className="relative">
                <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input pl-10 pr-12" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ix-muted hover:text-ix-text transition-colors">
                  {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-ix-red bg-ix-red/10 border border-ix-red/20 rounded-xl px-4 py-3">
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign in to InsightX'
              }
            </motion.button>
          </form>

          <p className="text-center text-xs text-ix-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-ix-accent hover:text-ix-accent2 transition-colors font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}