import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAIInsight } from '../../services/api/api'
import AIInsightCard from './AIInsightCard'
import { RiSparklingLine, RiRefreshLine, RiArrowDownSLine } from 'react-icons/ri'
import { AI_INSIGHTS_CACHE } from '../../data/mockData'

export default function AIRecommendationsPanel({ context = {}, title = 'AI Recommendations', maxItems = 4 }) {
  const [insights, setInsights] = useState(AI_INSIGHTS_CACHE.slice(0, maxItems))
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const prompt = `Context: ${JSON.stringify(context)}`
      const result = await generateAIInsight(prompt)
      const newInsight = {
        id: `ai-${Date.now()}`,
        icon: '✦',
        title: result.headline,
        summary: result.summary,
        recommendation: result.recommendation,
        severity: result.severity || 'info',
        timestamp: new Date().toISOString(),
      }
      setInsights(prev => [newInsight, ...prev.slice(0, maxItems - 1)])
    } catch (err) {
      setError('Could not generate AI insights. Check your Groq API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RiSparklingLine className="text-ix-accent text-lg" />
          <h3 className="font-display font-semibold text-ix-text">{title}</h3>
          <span className="text-[10px] font-mono text-ix-muted bg-ix-accent/10 border border-ix-accent/20 px-1.5 py-0.5 rounded">
            Groq AI
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg glass border border-ix-border text-ix-muted hover:text-ix-accent transition-all disabled:opacity-50">
            <RiRefreshLine className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-7 h-7 flex items-center justify-center rounded-lg glass border border-ix-border text-ix-muted hover:text-ix-text transition-all">
            <motion.div animate={{ rotate: expanded ? 0 : -90 }}>
              <RiArrowDownSLine className="text-sm" />
            </motion.div>
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-ix-amber bg-ix-amber/5 border border-ix-amber/20 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <AIInsightCard key={i} insight={null} loading={true} />
                  ))
                : insights.map((ins, i) => (
                    <AIInsightCard key={ins.id} insight={ins} index={i} />
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}