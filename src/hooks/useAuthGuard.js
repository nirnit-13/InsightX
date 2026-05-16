import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * useAuthGuard — redirects unauthenticated users to /login.
 * Optionally enforces role requirements.
 *
 * @param {string[]} allowedRoles - e.g. ['admin'] — if empty, any authenticated user passes.
 * @returns {{ user, isAdmin, hasAccess }}
 */
export function useAuthGuard(allowedRoles = []) {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate('/login', { state: { from: location }, replace: true })
      return
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, allowedRoles, navigate, location])

  const hasAccess = !!user && (allowedRoles.length === 0 || allowedRoles.includes(user?.role))

  return { user, isAdmin, hasAccess, loading }
}

export default useAuthGuard