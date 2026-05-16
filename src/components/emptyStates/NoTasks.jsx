import { motion } from 'framer-motion'
import { RiTaskLine, RiAddLine } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'

export default function NoTasks({ onAdd, filtered = false }) {
  const { isAdmin } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-ix-accent/10 border border-ix-accent/20 flex items-center justify-center mb-5">
        <RiTaskLine className="text-4xl text-ix-accent" />
      </div>
      <h3 className="font-display font-bold text-xl text-ix-text mb-2">
        {filtered ? 'No tasks match your filters' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-ix-muted mb-6 max-w-xs leading-relaxed">
        {filtered
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : isAdmin
          ? 'Create your first task to start tracking team progress and deadlines.'
          : 'No tasks have been assigned to you yet. Check back soon.'}
      </p>
      {!filtered && isAdmin && onAdd && (
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
          <RiAddLine /> Create First Task
        </button>
      )}
    </motion.div>
  )
}