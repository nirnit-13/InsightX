import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const MOCK_USERS = [
  { id: '1', name: 'Alex Rivera', email: 'admin@insightx.io', password: 'admin123', role: 'admin', avatar: 'AR', skills: ['React', 'Node.js', 'Python'], github: 'alexrivera', linkedin: 'alex-rivera', attendance: 96, productivity_score: 94 },
  { id: '2', name: 'Sam Chen', email: 'sam@insightx.io', password: 'pass123', role: 'contributor', avatar: 'SC', skills: ['Python', 'ML', 'FastAPI'], github: 'samchen', linkedin: 'sam-chen', attendance: 88, productivity_score: 82 },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ix_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safe } = found
      setUser(safe)
      localStorage.setItem('ix_user', JSON.stringify(safe))
      return { success: true, user: safe }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const signup = (name, email, password, role = 'contributor') => {
    const exists = MOCK_USERS.find(u => u.email === email)
    if (exists) return { success: false, error: 'Email already in use' }
    const newUser = {
      id: String(Date.now()), name, email, role,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      skills: [], github: '', linkedin: '', attendance: 100, productivity_score: 75
    }
    MOCK_USERS.push({ ...newUser, password })
    setUser(newUser)
    localStorage.setItem('ix_user', JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ix_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}