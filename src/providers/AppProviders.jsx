import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider }         from '../context/ThemeContext'
import { AuthProvider }          from '../context/AuthContext'
import { NotificationsProvider } from '../context/NotificationsContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:    30_000,   // 30s
      cacheTime:    300_000,  // 5min
      retry:        1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#111827',
                  color: '#f1f5f9',
                  border: '1px solid #1f2937',
                  borderRadius: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
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