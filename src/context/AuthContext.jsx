import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api/authAPI'

const AuthContext = createContext(null)

export const MOCK_USERS = [
  { id: '1', name: 'Alex Rivera', email: 'admin@insightx.io', password: 'admin123', role: 'admin', avatar: 'AR', color: '#6366f1', skills: ['React', 'Node.js', 'Python'], github: 'alexrivera', linkedin: 'alex-rivera', attendance: 96, productivity_score: 94, completed_tasks: 28, streak: 14, team: 'Frontend' },
  { id: '2', name: 'Sam Chen', email: 'sam@insightx.io', password: 'pass123', role: 'contributor', avatar: 'SC', color: '#06b6d4', skills: ['Python', 'ML', 'FastAPI'], github: 'samchen', linkedin: 'sam-chen', attendance: 88, productivity_score: 82, completed_tasks: 21, streak: 7, team: 'Backend' },
]

const USE_REAL_API = !!import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ix_user')
    const token  = localStorage.getItem('ix_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch {}
    } else if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  /* ── Real API login ── */
  const loginWithAPI = async (email, password) => {
    try {
      const data = await authAPI.login(email, password)
      const u = data.user
      localStorage.setItem('ix_token', data.access_token)
      localStorage.setItem('ix_user', JSON.stringify(u))
      setUser(u)
      return { success: true, user: u }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Invalid credentials' }
    }
  }

  /* ── Mock login fallback ── */
  const loginMock = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safe } = found
      setUser(safe)
      localStorage.setItem('ix_user', JSON.stringify(safe))
      return { success: true, user: safe }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const login = async (email, password) => {
    if (USE_REAL_API) return loginWithAPI(email, password)
    return loginMock(email, password)
  }

  /* ── Real API signup ── */
  const signupWithAPI = async (name, email, password, role = 'contributor') => {
    try {
      const data = await authAPI.signup(name, email, password, role)
      localStorage.setItem('ix_token', data.access_token)
      localStorage.setItem('ix_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Signup failed' }
    }
  }

  /* ── Mock signup fallback ── */
  const signupMock = (name, email, password, role = 'contributor') => {
    const exists = MOCK_USERS.find(u => u.email === email)
    if (exists) return { success: false, error: 'Email already in use' }
    const newUser = {
      id: String(Date.now()), name, email, role,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: '#6366f1',
      skills: [], github: '', linkedin: '', attendance: 100, productivity_score: 75,
      completed_tasks: 0, streak: 0, team: 'General',
    }
    MOCK_USERS.push({ ...newUser, password })
    setUser(newUser)
    localStorage.setItem('ix_user', JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  const signup = async (name, email, password, role = 'contributor') => {
    if (USE_REAL_API) return signupWithAPI(name, email, password, role)
    return signupMock(name, email, password, role)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ix_token')
    localStorage.removeItem('ix_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('ix_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout, updateUser,
      isAdmin: user?.role === 'admin',
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