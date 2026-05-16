import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { RiShieldLine } from 'react-icons/ri'

/* ── Full-screen loader ── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ background: 'var(--bg, #050810)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-body" style={{ color: '#64748b' }}>Loading InsightX…</p>
      </div>
    </div>
  )
}

/* ── Access denied page ── */
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-12 text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <RiShieldLine className="text-3xl text-red-500" />
        </div>
        <h2 className="font-display font-bold text-xl dark:text-slate-100 light:text-slate-800 mb-3">
          Access Restricted
        </h2>
        <p className="text-sm dark:text-slate-400 light:text-slate-500 mb-6">
          You don't have permission to view this page.
        </p>
        <a href="/dashboard" className="btn-primary text-sm px-6 py-2.5 inline-block">
          Back to Dashboard
        </a>
      </motion.div>
    </div>
  )
}

/**
 * RoleProtectedRoute
 * @param {string[]} allowedRoles - e.g. ['admin'] or ['admin','contributor']
 * @param {React.ReactNode} children
 */
export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <AccessDenied />
  }

  return children
}