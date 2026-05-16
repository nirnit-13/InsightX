import { RiSunLine, RiMoonLine } from 'react-icons/ri'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme()

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all ${className}`}>
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  )
}

function AnimatedIcon({ isDark }) {
  return (
    <motion.div
      key={isDark ? 'moon' : 'sun'}
      initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.2 }}>
      {isDark ? (
        <RiMoonLine className="text-lg text-ix-accent" />
      ) : (
        <RiSunLine className="text-lg text-ix-amber" />
      )}
    </motion.div>
  )
}