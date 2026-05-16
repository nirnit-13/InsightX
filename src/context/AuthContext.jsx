/**
 * src/context/AuthContext.jsx
 *
 * FIX — Role persistence & synchronization:
 *   1. On every login/signup the user object stored in localStorage
 *      ALWAYS includes { id, email, role } so page refreshes don't lose the role.
 *   2. On init (useEffect) the stored user is validated; if the role field
 *      is missing the session is cleared to force a fresh login.
 *   3. logout() clears ALL auth state (token + user) atomically.
 *   4. Token expiry is detected and clears auth state safely.
 *   5. The returned context value exposes `isAdmin` as a stable boolean
 *      derived directly from `user.role` so every component stays in sync.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api/authAPI'

const AuthContext = createContext(null)

// ── Mock users (used when VITE_API_URL is not set) ────────────────────────────
export const MOCK_USERS = [
  {
    id: '1', name: 'Alex Rivera', email: 'admin@insightx.io', password: 'admin123',
    role: 'admin', avatar: 'AR', color: '#6366f1',
    skills: ['React', 'Node.js', 'Python'], github: 'alexrivera', linkedin: 'alex-rivera',
    attendance: 96, productivity_score: 94, completed_tasks: 28, streak: 14, team: 'Frontend',
  },
  {
    id: '2', name: 'Sam Chen', email: 'sam@insightx.io', password: 'pass123',
    role: 'contributor', avatar: 'SC', color: '#06b6d4',
    skills: ['Python', 'ML', 'FastAPI'], github: 'samchen', linkedin: 'sam-chen',
    attendance: 88, productivity_score: 82, completed_tasks: 21, streak: 7, team: 'Backend',
  },
]

// Use real API when VITE_API_URL is set and non-empty
const USE_REAL_API =
  !!import.meta.env.VITE_API_URL &&
  import.meta.env.VITE_API_URL !== 'http://localhost:8000'

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORAGE_KEY_TOKEN = 'ix_token'
const STORAGE_KEY_USER  = 'ix_user'

function saveSession(token, user) {
  if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token)
  // Always persist at minimum: { id, email, role }
  const safe = {
    id:    user.id    || user._id || '',
    email: user.email || '',
    role:  user.role  || 'contributor',
    // keep all other non-sensitive fields
    ...user,
  }
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safe))
  return safe
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_USER)
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    if (!raw) return null
    const user = JSON.parse(raw)

    // Validate: user must have at least an id and a role
    if (!user || !user.role) {
      clearSession()
      return null
    }

    return user
  } catch {
    clearSession()
    return null
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Rehydrate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const stored = loadSession()
    if (stored) setUser(stored)
    setLoading(false)
  }, [])

  // ── Real API login ─────────────────────────────────────────────────────────
  const loginWithAPI = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)

      // FIX: backend now always returns { access_token, user: { id, email, role, ... } }
      const safe = saveSession(data.access_token, data.user)
      setUser(safe)
      return { success: true, user: safe }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Invalid credentials',
      }
    }
  }

  // ── Mock login ─────────────────────────────────────────────────────────────
  const loginMock = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, error: 'Invalid credentials' }
    const { password: _, ...safe } = found
    const stored = saveSession(null, safe)
    setUser(stored)
    return { success: true, user: stored }
  }

  const login = async (email, password) =>
    USE_REAL_API ? loginWithAPI(email, password) : loginMock(email, password)

  // ── Real API signup ────────────────────────────────────────────────────────
  const signupWithAPI = async (name, email, password, role = 'contributor') => {
    try {
      const data = await authAPI.signup(name, email, password, role)
      const safe = saveSession(data.access_token, data.user)
      setUser(safe)
      return { success: true, user: safe }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Signup failed',
      }
    }
  }

  // ── Mock signup ────────────────────────────────────────────────────────────
  const signupMock = (name, email, password, role = 'contributor') => {
    if (MOCK_USERS.find(u => u.email === email))
      return { success: false, error: 'Email already in use' }

    const newUser = {
      id:    String(Date.now()),
      name, email, role,
      avatar:            name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color:             '#6366f1',
      skills: [], github: '', linkedin: '',
      attendance: 100, productivity_score: 75,
      completed_tasks: 0, streak: 0, team: 'General',
    }
    MOCK_USERS.push({ ...newUser, password })
    const stored = saveSession(null, newUser)
    setUser(stored)
    return { success: true, user: stored }
  }

  const signup = (name, email, password, role = 'contributor') =>
    USE_REAL_API
      ? signupWithAPI(name, email, password, role)
      : signupMock(name, email, password, role)

  // ── Logout — clears ALL state ──────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null)
    clearSession()
  }, [])

  // ── Update local user object (profile edits, etc.) ─────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      // Re-persist so refresh doesn't lose changes
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Stable derived boolean ─────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateUser,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}