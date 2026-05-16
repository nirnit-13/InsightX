/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  /*
   * darkMode: 'class' — ThemeContext adds/removes 'dark' on <html>.
   * Colors below use CSS variable references so every component automatically
   * responds to theme switching without needing `dark:` variants everywhere.
   *
   * FIX: Previously colors were hardcoded hex values (e.g. ix-text: '#f1f5f9')
   * which NEVER changed regardless of light/dark mode. Now they reference
   * CSS variables defined in index.css, which DO change per theme.
   *
   * Usage stays identical:  className="text-ix-text bg-ix-card"
   * The CSS var resolves to the right value for the active theme.
   */
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ix: {
          bg:      'var(--ix-bg)',
          surface: 'var(--ix-surface)',
          card:    'var(--ix-card)',
          border:  'var(--ix-border-solid)',
          accent:  '#6366f1',   // brand color — doesn't change with theme
          accent2: '#8b5cf6',   // brand color — doesn't change with theme
          cyan:    '#06b6d4',   // brand color — doesn't change with theme
          green:   '#10b981',   // brand color — doesn't change with theme
          red:     '#ef4444',   // brand color — doesn't change with theme
          amber:   '#f59e0b',   // brand color — doesn't change with theme
          text:    'var(--ix-text)',
          muted:   'var(--ix-muted)',
          subtle:  'var(--ix-subtle)',
        },
      },
      backgroundImage: {
        'grid-pattern':  "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        'glow-purple':   'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-cyan':     'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(99,102,241,0.3)',
        'glow-sm':    '0 0 10px rgba(99,102,241,0.2)',
        'glow-cyan':  '0 0 20px rgba(6,182,212,0.3)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
          '50%':      { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        },
      },
    },
  },
  plugins: [],
}