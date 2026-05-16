/**
 * src/providers/AppProviders.jsx
 *
 * FIX — React Query retry loop eliminated:
 *   Previously, React Query used retry:1 globally, meaning EVERY failed
 *   query (including 401 Unauthorized and 403 Forbidden) was retried once.
 *   This caused the "Access Denied: Insufficient Permission" message to
 *   flash repeatedly as the same forbidden request was fired twice.
 *
 *   The fix: a custom `retry` function that returns false for 401 and 403
 *   responses, preventing any retry on auth/permission failures.
 *   Other errors (network, 500) still get up to 1 retry.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider }         from '../context/ThemeContext'
import { AuthProvider }          from '../context/AuthContext'
import { NotificationsProvider } from '../context/NotificationsContext'
import ErrorBoundary             from '../components/ErrorBoundary'

// ── Custom retry function ─────────────────────────────────────────────────────
/**
 * FIX: Never retry on 401 (Unauthorized) or 403 (Forbidden).
 *
 * Retrying auth failures causes the "Access Denied" banner to flash
 * multiple times and hammers the server with known-bad requests.
 *
 * @param {number}    failureCount - how many times this query has already failed
 * @param {unknown}   error        - the axios error object
 * @returns {boolean} whether to retry
 */
function shouldRetry(failureCount, error) {
  // Extract HTTP status from axios error
  const status = error?.response?.status

  // Never retry auth or permission errors
  if (status === 401 || status === 403) return false

  // Also don't retry 404 (resource not found — unlikely to appear on retry)
  if (status === 404) return false

  // Allow 1 retry for other errors (network issues, 500s, etc.)
  return failureCount < 1
}

// ── Query client ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      gcTime:               300_000,
      retry:                shouldRetry,   // ← FIX: no retry on 401/403
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,   // never retry mutations
    },
  },
})

// ── Provider tree ─────────────────────────────────────────────────────────────
export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background:   '#111827',
                  color:        '#f1f5f9',
                  border:       '1px solid #1f2937',
                  borderRadius: '12px',
                  fontFamily:   'DM Sans, sans-serif',
                  fontSize:     '13px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
              }}
            />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}