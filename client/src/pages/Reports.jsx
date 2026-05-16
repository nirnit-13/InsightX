import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAIInsight, generateReport, chatWithAI } from '../services/api/api'
import { OVERVIEW_STATS, CONTRIBUTORS, TASKS, AI_INSIGHTS_CACHE } from '../data/mockData'
import { InsightCard, Spinner } from '../components/ui/Components'
import { exportReportPDF, exportAnalyticsCSV, exportLeaderboardCSV } from '../utils/exportUtils'
import {
  RiBrainLine,
  RiSendPlane2Line,
  RiFileTextLine,
  RiDownloadLine,
  RiRefreshLine,
  RiSparklingLine,
  RiUser3Line,
  RiRobot2Line,
  RiFileExcel2Line,
  RiAlertLine,
} from 'react-icons/ri'

const PROMPT_SUGGESTIONS = [
  'Who performed best this week?',
  'Summarize team productivity trends.',
  'Which tasks are most at risk?',
  'Show inactive contributors.',
  'What are the top 3 recommendations?',
]

const REPORT_TYPES = [
  { id: 'weekly',       label: 'Weekly Summary',       icon: '📊', desc: 'Full team performance report for this week' },
  { id: 'productivity', label: 'Productivity Report',   icon: '⚡', desc: 'In-depth productivity analysis with recommendations' },
  { id: 'contributor',  label: 'Contributor Spotlight', icon: '👤', desc: 'Individual contributor performance breakdown' },
  { id: 'anomaly',      label: 'Anomaly Detection',     icon: '🔍', desc: 'Detect unusual patterns and outliers in data' },
]

const context = {
  stats: OVERVIEW_STATS,
  contributors: CONTRIBUTORS.map(c => ({
    name: c.name, team: c.team, score: c.productivity_score,
    attendance: c.attendance, tasks: c.completed_tasks, streak: c.streak,
  })),
  tasks: TASKS.map(t => ({ title: t.title, status: t.status, priority: t.priority, deadline: t.deadline })),
}

function NoAPIKeyNotice() {
  return (
    <div className="p-4 rounded-xl border border-ix-amber/20 bg-ix-amber/5 flex items-start gap-3 mb-5">
      <RiAlertLine className="text-ix-amber text-lg flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-display font-semibold text-ix-amber">Groq API key not configured</p>
        <p className="text-xs text-ix-muted mt-1">
          Add <code className="font-mono bg-white/5 px-1 rounded">VITE_GROQ_API_KEY=your_key</code> to your <code className="font-mono bg-white/5 px-1 rounded">.env</code> file.
          Get a free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-ix-accent underline">console.groq.com</a>
        </p>
      </div>
    </div>
  )
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('insights')
  const [insights, setInsights] = useState(AI_INSIGHTS_CACHE)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your InsightX AI assistant powered by Groq (LLaMA 3.3 70B). Ask me anything about your contributors, tasks, or analytics data.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const groqKeySet = !!import.meta.env.VITE_GROQ_API_KEY

  const generateInsights = async () => {
    setLoading(true)
    setApiError('')
    try {
      const prompt = `Team stats: ${JSON.stringify(context.stats)}. Top contributors: ${JSON.stringify(context.contributors.slice(0, 3))}`
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
      setInsights(prev => [newInsight, ...prev.slice(0, 5)])
    } catch (err) {
      setApiError(err.message || 'Failed to generate insight')
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyReport = async (type) => {
    setReportLoading(true)
    setReport(null)
    setApiError('')
    try {
      const result = await generateReport({ ...context, reportType: type })
      setReport(result)
    } catch (err) {
      setApiError(err.message || 'Failed to generate report')
      // Show fallback report
      setReport({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analytics Report — May 2025`,
        executive_summary: 'Team productivity is at an all-time high this quarter with strong engagement metrics.',
        highlights: ['Maria Santos completed 30 tasks — highest this quarter', 'Team attendance average at 89%', 'Frontend team shipped 3 major features'],
        concerns: ['Jordan Lee\'s attendance has dipped below team average'],
        recommendations: ['Schedule 1:1 with Jordan Lee to identify blockers', 'Redistribute tasks from Backend to Design team'],
        forecast: 'With current momentum, Q2 targets are achievable ahead of schedule.',
      })
    } finally {
      setReportLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setPdfExporting(true)
    await exportReportPDF(report)
    setPdfExporting(false)
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)
    setApiError('')
    try {
      const response = await chatWithAI([...chatMessages, userMsg], context)
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message || 'Error — check your Groq API key.'}` }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ix-text flex items-center gap-3">
          <RiBrainLine className="text-ix-accent" /> AI Reports & Insights
        </h1>
        <p className="text-ix-muted text-sm mt-1">
          Powered by{' '}
          <span className="text-ix-accent font-mono">Groq · LLaMA 3.3 70B</span>
          {' '}— real-time analytics intelligence
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-ix-border pb-4">
        {[
          { id: 'insights', label: 'Live Insights',    icon: RiSparklingLine },
          { id: 'reports',  label: 'Generate Reports', icon: RiFileTextLine },
          { id: 'chat',     label: 'AI Chat',          icon: RiRobot2Line },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-ix-accent text-white shadow-glow-sm'
                : 'text-ix-muted hover:text-ix-text hover:bg-white/5'
            }`}>
            <tab.icon className="text-base" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Insights */}
      {activeTab === 'insights' && (
        <div>
          {!groqKeySet && <NoAPIKeyNotice />}
          {apiError && (
            <div className="p-3 rounded-xl border border-ix-red/20 bg-ix-red/5 text-xs text-ix-red mb-4">{apiError}</div>
          )}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <p className="text-sm text-ix-muted">Showing {insights.length} insights</p>
              <button onClick={exportAnalyticsCSV}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5">
                <RiFileExcel2Line /> Export CSV
              </button>
            </div>
            <button onClick={generateInsights} disabled={loading}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              {loading ? <><Spinner size="sm" /> Generating...</> : <><RiRefreshLine /> Generate with Groq</>}
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {insights.map((ins, i) => <InsightCard key={ins.id} insight={ins} index={i} />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div>
          {!groqKeySet && <NoAPIKeyNotice />}
          {apiError && (
            <div className="p-3 rounded-xl border border-ix-amber/20 bg-ix-amber/5 text-xs text-ix-amber mb-4">
              ⚠️ {apiError} — showing fallback report below.
            </div>
          )}
          <p className="text-sm text-ix-muted mb-5">Select a report type to generate with Groq AI</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {REPORT_TYPES.map(rt => (
              <motion.button key={rt.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => generateWeeklyReport(rt.id)}
                className="glass rounded-xl p-5 border border-ix-border hover:border-ix-accent/30 text-left transition-all">
                <span className="text-2xl mb-3 block">{rt.icon}</span>
                <h3 className="font-display font-semibold text-ix-text mb-1">{rt.label}</h3>
                <p className="text-xs text-ix-muted">{rt.desc}</p>
              </motion.button>
            ))}
          </div>

          {reportLoading && (
            <div className="glass rounded-2xl p-12 border border-ix-border flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-ix-muted font-body">Groq is generating your report...</p>
            </div>
          )}

          <AnimatePresence>
            {report && !reportLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-ix-accent/20 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-ix-accent/10 to-ix-accent2/10 border-b border-ix-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-ix-green animate-pulse" />
                        <span className="text-[10px] font-mono text-ix-green uppercase tracking-wider">Groq AI Generated</span>
                      </div>
                      <h2 className="font-display font-bold text-xl text-ix-text">{report.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={exportAnalyticsCSV}
                        className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
                        <RiFileExcel2Line /> CSV
                      </button>
                      <button onClick={handleExportPDF} disabled={pdfExporting}
                        className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
                        {pdfExporting
                          ? <><Spinner size="sm" /> Exporting...</>
                          : <><RiDownloadLine /> PDF</>}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-mono text-ix-muted uppercase tracking-wider mb-3">Executive Summary</h3>
                    <p className="text-sm text-ix-text leading-relaxed">{report.executive_summary}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-ix-muted uppercase tracking-wider mb-3">Key Highlights</h3>
                    <div className="space-y-2">
                      {report.highlights?.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-ix-green mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-ix-text">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-ix-muted uppercase tracking-wider mb-3">Areas of Concern</h3>
                    <div className="space-y-2">
                      {report.concerns?.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-ix-amber mt-0.5 flex-shrink-0">⚠</span>
                          <span className="text-ix-text">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-ix-accent/5 border border-ix-accent/15">
                    <h3 className="text-xs font-mono text-ix-accent uppercase tracking-wider mb-3">AI Recommendations</h3>
                    <div className="space-y-2">
                      {report.recommendations?.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-ix-accent mt-0.5 flex-shrink-0">→</span>
                          <span className="text-ix-text">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-ix-muted uppercase tracking-wider mb-2">Outlook</h3>
                    <p className="text-sm text-ix-muted italic">{report.forecast}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tab: Chat */}
      {activeTab === 'chat' && (
        <div>
          {!groqKeySet && <NoAPIKeyNotice />}
          <div className="glass rounded-2xl border border-ix-border overflow-hidden flex flex-col" style={{ height: '500px' }}>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-ix-accent/20 border border-ix-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RiRobot2Line className="text-ix-accent text-sm" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-ix-accent text-white rounded-br-none'
                      : 'glass border border-ix-border text-ix-text rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RiUser3Line className="text-ix-muted text-sm" />
                    </div>
                  )}
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-ix-accent/20 border border-ix-accent/30 flex items-center justify-center">
                    <RiRobot2Line className="text-ix-accent text-sm" />
                  </div>
                  <div className="glass border border-ix-border rounded-xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 0.2, 0.4].map(d => (
                        <motion.div key={d} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1, delay: d }}
                          className="w-1.5 h-1.5 rounded-full bg-ix-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-ix-border flex gap-2 overflow-x-auto">
              {PROMPT_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)}
                  className="flex-shrink-0 text-[10px] font-mono text-ix-muted border border-ix-border px-2.5 py-1.5 rounded-lg hover:border-ix-accent/30 hover:text-ix-accent transition-all">
                  {s}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-ix-border flex gap-3">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about your contributors, tasks, or analytics..."
                className="input flex-1 text-sm" />
              <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
                className="btn-primary w-10 h-10 flex items-center justify-center p-0 rounded-xl flex-shrink-0 disabled:opacity-50">
                <RiSendPlane2Line />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}