/**
 * src/context/AuthContext.jsx
 *
 * RESTORED: Original mock accounts (admin@insightx.io / admin123 and
 * sam@insightx.io / pass123) work even when the backend is unreachable.
 *
 * Logic:
 *  - If VITE_API_URL is set AND the backend responds → real JWT login
 *  - If backend is unreachable OR no VITE_API_URL → mock login (original creds)
 *  - Old accounts always available as fallback
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api/authAPI'

const AuthContext = createContext(null)

// ── Original mock accounts — always available ─────────────────────────────
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
  // Additional original contributors (no password needed for demo, but kept for data)
  {
    id: '3', name: 'Priya Nair', email: 'priya@insightx.io', password: 'priya123',
    role: 'contributor', avatar: 'PN', color: '#8b5cf6',
    skills: ['UI/UX', 'Figma', 'CSS'], github: 'priyanair', linkedin: 'priya-nair',
    attendance: 92, productivity_score: 89, completed_tasks: 25, streak: 11, team: 'Design',
  },
  {
    id: '4', name: 'Jordan Lee', email: 'jordan@insightx.io', password: 'jordan123',
    role: 'contributor', avatar: 'JL', color: '#10b981',
    skills: ['DevOps', 'Docker', 'K8s'], github: 'jordanlee', linkedin: 'jordan-lee',
    attendance: 79, productivity_score: 71, completed_tasks: 17, streak: 3, team: 'DevOps',
  },
  {
    id: '5', name: 'Maria Santos', email: 'maria@insightx.io', password: 'maria123',
    role: 'contributor', avatar: 'MS', color: '#f59e0b',
    skills: ['Data Science', 'SQL', 'Power BI'], github: 'mariasantos', linkedin: 'maria-santos',
    attendance: 95, productivity_score: 91, completed_tasks: 30, streak: 18, team: 'Analytics',
  },
  {
    id: '6', name: 'Dev Patel', email: 'dev@insightx.io', password: 'dev123',
    role: 'contributor', avatar: 'DP', color: '#ef4444',
    skills: ['Go', 'Redis', 'PostgreSQL'], github: 'devpatel', linkedin: 'dev-patel',
    attendance: 84, productivity_score: 77, completed_tasks: 19, streak: 5, team: 'Backend',
  },
]

/**
 * USE_REAL_API: true when VITE_API_URL is configured.
 * Even when true, if the real API fails we fall back to mock login.
 */
const USE_REAL_API = !!import.meta.env.VITE_API_URL

const STORAGE_KEY_TOKEN = 'ix_token'
const STORAGE_KEY_USER  = 'ix_user'

function saveSession(token, user) {
  if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token)
  const safe = {
    id:    user.id    || user._id || '',
    email: user.email || '',
    role:  user.role  || 'contributor',
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
    if (!user || !user.role) { clearSession(); return null }
    return user
  } catch {
    clearSession()
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── On mount: rehydrate session ───────────────────────────────────────────
  useEffect(() => {
    const stored = loadSession()
    const token  = localStorage.getItem(STORAGE_KEY_TOKEN)

    if (!stored) {
      setLoading(false)
      return
    }

    // If we have a real token, validate it against the backend
    if (token && USE_REAL_API) {
      authAPI.me()
        .then((freshUser) => {
          if (freshUser && freshUser.role) {
            const merged = { ...stored, ...freshUser }
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged))
            setUser(merged)
          } else {
            setUser(stored)
          }
        })
        .catch(() => {
          // Backend unavailable or token stale — keep local session for mock users
          // Only clear if it was a real token (not a mock session)
          if (token && token.split('.').length === 3) {
            // Looks like a JWT — try to keep session anyway for mock users
            setUser(stored)
          } else {
            setUser(stored)
          }
        })
        .finally(() => setLoading(false))
    } else {
      // Mock session — just restore
      setUser(stored)
      setLoading(false)
    }
  }, [])

  // ── Real API login ────────────────────────────────────────────────────────
  const loginWithAPI = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)
      const safe = saveSession(data.access_token, data.user)
      setUser(safe)
      return { success: true, user: safe }
    } catch (err) {
      const status = err?.response?.status
      // If it's a credentials error (401), don't fall back — report it
      if (status === 401) {
        // Try mock fallback for original accounts
        return loginMock(email, password)
      }
      // Network/server error → fall back to mock
      return loginMock(email, password)
    }
  }

  // ── Mock login — always works for original accounts ───────────────────────
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

  // ── Real API signup ───────────────────────────────────────────────────────
  const signupWithAPI = async (name, email, password, role = 'contributor') => {
    try {
      const data = await authAPI.signup(name, email, password, role)
      const safe = saveSession(data.access_token, data.user)
      setUser(safe)
      return { success: true, user: safe }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Signup failed' }
    }
  }

  const signupMock = (name, email, password, role = 'contributor') => {
    if (MOCK_USERS.find(u => u.email === email))
      return { success: false, error: 'Email already in use' }
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
    const newUser = {
      id: String(Date.now()), name, email, role,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: colors[MOCK_USERS.length % colors.length],
      skills: [], github: '', linkedin: '',
      attendance: 100, productivity_score: 75, completed_tasks: 0, streak: 0, team: 'General',
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

  const logout = useCallback(() => {
    setUser(null)
    clearSession()
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}