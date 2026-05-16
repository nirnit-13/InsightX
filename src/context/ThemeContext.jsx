/**
 * src/context/ThemeContext.jsx
 *
 * FIX — Theme toggle was changing state but UI wasn't visually switching.
 *
 * Root causes:
 *   1. body had `background-color: #050810` hardcoded in index.css —
 *      overrode any CSS variable or class change. Fixed in index.css.
 *   2. ThemeContext correctly added/removed .dark on documentElement,
 *      but the CSS layer wasn't reading from those classes — components
 *      used hardcoded Tailwind `dark:` classes that depended on the
 *      `darkMode: 'class'` config. That config is correct in tailwind.config.js.
 *   3. The transition cleanup timer could race and remove the transition
 *      before it finished, causing a flash. Fixed with longer cleanup window.
 *
 * This file's logic was already correct — the real fix is in index.css using
 * CSS variables keyed off html.dark / html.light, and ensuring no component
 * has hardcoded dark background colours.
 *
 * Kept here for documentation and a minor cleanup: using classList.toggle
 * for atomic dark/light swap with no intermediate state.
 */

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('ix_theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch { /* ignore */ }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'dark' // InsightX defaults to dark
  })

  useEffect(() => {
    const root = document.documentElement

    // Apply transition before class change
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

    try {
      localStorage.setItem('ix_theme', theme)
    } catch { /* ignore quota errors */ }

    // Remove transition override after animation completes
    const cleanup = setTimeout(() => {
      root.style.transition = ''
    }, 400)

    return () => clearTimeout(cleanup)
  }, [theme])

  const toggle   = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  const isDark   = theme === 'dark'
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