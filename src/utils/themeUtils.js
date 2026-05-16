/**
 * themeUtils.js — Theme and chart theming utilities.
 */

export const DARK_CHART_THEME = {
  axis: {
    fill: '#64748b',
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
  },
  grid: 'rgba(255,255,255,0.04)',
  tooltip: {
    contentStyle: {
      background: 'rgba(13,17,23,0.95)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '12px',
      color: '#f1f5f9',
      fontSize: '12px',
      fontFamily: 'DM Sans, sans-serif',
    },
    labelStyle: { color: '#94a3b8', fontFamily: 'DM Sans' },
  },
}

export const LIGHT_CHART_THEME = {
  axis: {
    fill: '#94a3b8',
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
  },
  grid: 'rgba(0,0,0,0.06)',
  tooltip: {
    contentStyle: {
      background: '#ffffff',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '12px',
      color: '#1e293b',
      fontSize: '12px',
      fontFamily: 'DM Sans, sans-serif',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    },
    labelStyle: { color: '#64748b', fontFamily: 'DM Sans' },
  },
}

/**
 * Get chart theme based on current mode.
 */
export function getChartTheme(isDark = true) {
  return isDark ? DARK_CHART_THEME : LIGHT_CHART_THEME
}

/**
 * CSS class helpers for theme-aware text/bg.
 */
export const themeClasses = {
  text:        'dark:text-slate-100 text-slate-800',
  textMuted:   'dark:text-slate-400 text-slate-500',
  textSubtle:  'dark:text-slate-500 text-slate-400',
  bg:          'dark:bg-[#050810] bg-slate-50',
  surface:     'dark:bg-[#0d1117] bg-white',
  card:        'dark:bg-[#111827] bg-white',
  border:      'dark:border-[#1f2937] border-slate-200',
  hover:       'dark:hover:bg-white/5 hover:bg-slate-50',
}

/**
 * Resolve CSS variable values at runtime.
 */
export function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}