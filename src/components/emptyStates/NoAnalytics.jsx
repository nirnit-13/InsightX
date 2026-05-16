import { motion } from 'framer-motion'
import { RiBarChartBoxLine, RiRefreshLine } from 'react-icons/ri'

export default function NoAnalytics({ onRefresh, message = 'No analytics data available yet.' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-ix-accent2/10 border border-ix-accent2/20 flex items-center justify-center mb-5">
        <RiBarChartBoxLine className="text-4xl text-ix-accent2" />
      </div>
      <h3 className="font-display font-bold text-xl text-ix-text mb-2">No Data Yet</h3>
      <p className="text-sm text-ix-muted mb-6 max-w-xs leading-relaxed">{message}</p>
      {onRefresh && (
        <button onClick={onRefresh} className="btn-ghost flex items-center gap-2 text-sm px-5 py-2.5">
          <RiRefreshLine /> Refresh Data
        </button>
      )}
    </motion.div>
  )
}