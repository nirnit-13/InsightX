import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('ix_theme')
    if (stored) return stored
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'dark' // default dark for InsightX
  })

  useEffect(() => {
    const root = document.documentElement
    /* smooth transition on theme change */
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease'

    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('ix_theme', theme)

    /* cleanup transition after it completes */
    const cleanup = setTimeout(() => {
      root.style.transition = ''
    }, 300)
    return () => clearTimeout(cleanup)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  const isDark  = theme === 'dark'
  const setDark  = () => setTheme('dark')
  const setLight = () => setTheme('light')

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark, setDark, setLight }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}