import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { RiFlashlightLine, RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'contributor' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const result = signup(form.name, form.email, form.password, form.role)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 bg-grid opacity-100" />
      <div className="fixed top-1/3 right-1/4 w-56 h-56 bg-ix-accent2/8 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ix-accent to-ix-accent2 flex items-center justify-center shadow-glow-sm">
              <RiFlashlightLine className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-ix-text">InsightX</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-ix-text mb-2">Create your account</h1>
          <p className="text-ix-muted text-sm">Join InsightX and unlock contributor intelligence</p>
        </div>

        <div className="glass rounded-2xl p-7 border border-ix-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">FULL NAME</label>
              <div className="relative">
                <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="Alex Rivera" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
                <input type="email" required value={form.email} onChange={set('email')}
                  placeholder="you@company.com" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">PASSWORD</label>
              <div className="relative">
                <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-ix-muted text-sm" />
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className="input pl-10 pr-12" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ix-muted hover:text-ix-text transition-colors">
                  {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ix-muted mb-2">ROLE</label>
              <select value={form.role} onChange={set('role')}
                className="input appearance-none cursor-pointer">
                <option value="contributor">Contributor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-ix-red bg-ix-red/10 border border-ix-red/20 rounded-xl px-4 py-3">
                {error}
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-xs text-ix-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ix-accent hover:text-ix-accent2 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}