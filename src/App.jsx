import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'

// Pages
import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Signup       from './pages/Signup'
import Dashboard    from './pages/Dashboard'
import Contributors from './pages/Contributors'
import Tasks        from './pages/Tasks'
import Leaderboard  from './pages/Leaderboard'
import Reports      from './pages/Reports'
import Profile      from './pages/Profile'

// Layout — uses centralized Sidebar component
import AppLayout from './components/layout/AppLayout'

// ── Auth guards ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ix-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-ix-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-ix-muted text-sm font-body">Loading InsightX...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected dashboard shell — AppLayout uses centralized Sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Shared routes — both admin and contributor */}
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="tasks"       element={<Tasks />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile"     element={<Profile />} />

          {/* Admin-only routes */}
          <Route
            path="contributors"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Contributors />
              </RoleProtectedRoute>
            }
          />
          
          <Route
            path="reports"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}