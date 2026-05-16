import { motion } from 'framer-motion'
import { RiTeamLine, RiAddLine, RiUploadCloud2Line } from 'react-icons/ri'

export default function NoContributors({ onAdd, onImport, filtered = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-ix-cyan/10 border border-ix-cyan/20 flex items-center justify-center mb-5">
        <RiTeamLine className="text-4xl text-ix-cyan" />
      </div>
      <h3 className="font-display font-bold text-xl text-ix-text mb-2">
        {filtered ? 'No contributors found' : 'No contributors yet'}
      </h3>
      <p className="text-sm text-ix-muted mb-6 max-w-xs leading-relaxed">
        {filtered
          ? 'Try adjusting your search or team filter.'
          : 'Add your first contributor manually or import a CSV to get started.'}
      </p>
      {!filtered && (
        <div className="flex items-center gap-3">
          {onImport && (
            <button onClick={onImport} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5">
              <RiUploadCloud2Line /> Import CSV
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
              <RiAddLine /> Add Contributor
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}