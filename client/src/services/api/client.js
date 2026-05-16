import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

/* ── Request — inject token ── */
client.interceptors.request.use(config => {
  const token = localStorage.getItem('ix_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ── Response — handle errors globally ── */
client.interceptors.response.use(
  res => res.data,
  err => {
    const status  = err.response?.status
    const message = err.response?.data?.detail || err.message || 'An error occurred'

    if (status === 401) {
      localStorage.removeItem('ix_token')
      localStorage.removeItem('ix_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('Access denied — insufficient permissions')
    } else if (status === 404) {
      // silent — let callers handle
    } else if (status >= 500) {
      toast.error('Server error — please try again')
    } else if (message) {
      toast.error(message)
    }

    return Promise.reject(err)
  }
)

export default client