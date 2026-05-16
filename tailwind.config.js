/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  /*
   * FIX — darkMode: 'class' is correct and must stay here.
   * ThemeContext adds/removes the 'dark' class on <html>.
   * Tailwind then applies all `dark:` variants.
   * The theme switch wasn't visually working because index.css had
   * a hardcoded body background — fixed there. This config is correct.
   */
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ix: {
          // Dark mode colours (default brand palette)
          bg:      '#050810',
          surface: '#0d1117',
          card:    '#111827',
          border:  '#1f2937',
          accent:  '#6366f1',
          accent2: '#8b5cf6',
          cyan:    '#06b6d4',
          green:   '#10b981',
          red:     '#ef4444',
          amber:   '#f59e0b',
          text:    '#f1f5f9',
          muted:   '#64748b',
          subtle:  '#1e2d3d',
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        'glow-purple': 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow':      '0 0 20px rgba(99,102,241,0.3)',
        'glow-sm':   '0 0 10px rgba(99,102,241,0.2)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'gradient-x':  'gradient-x 4s ease infinite',
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
      }
    },
  },
  plugins: [],
}