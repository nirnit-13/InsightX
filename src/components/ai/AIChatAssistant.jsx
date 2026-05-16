import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatWithAI } from '../../services/api/api'
import { RiRobot2Line, RiUser3Line, RiSendPlane2Line, RiCloseLine, RiSparklingLine } from 'react-icons/ri'

const SUGGESTIONS = [
  'Who is the top performer this week?',
  'Which tasks are overdue?',
  'Summarize team productivity.',
  'What are the top 3 risks?',
]

export default function AIChatAssistant({ context = {}, onClose, embedded = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your InsightX AI assistant powered by Groq LLaMA 3.3. Ask me anything about your contributors, tasks, or analytics.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = text || input
    if (!content.trim() || loading) return
    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const response = await chatWithAI([...messages, userMsg], context)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message || 'Could not connect to AI. Check your Groq API key.'}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const Wrapper = embedded ? 'div' : motion.div

  return (
    <Wrapper
      {...(!embedded ? {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 },
      } : {})}
      className="glass border border-ix-border rounded-2xl overflow-hidden flex flex-col"
      style={{ height: embedded ? '480px' : '520px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ix-border bg-ix-accent/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ix-accent/20 border border-ix-accent/30 flex items-center justify-center">
            <RiRobot2Line className="text-ix-accent text-sm" />
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-ix-text">InsightX AI</p>
            <p className="text-[10px] font-mono text-ix-muted">Groq · LLaMA 3.3 70B</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono text-ix-green">
            <span className="w-1.5 h-1.5 rounded-full bg-ix-green animate-pulse" />
            Online
          </span>
          {onClose && (
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-ix-muted hover:text-ix-text transition-all">
              <RiCloseLine />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-ix-accent/20 border border-ix-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RiRobot2Line className="text-ix-accent text-xs" />
                </div>
              )}
              <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-ix-accent text-white rounded-br-none'
                  : 'glass border border-ix-border text-ix-text rounded-bl-none'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <RiUser3Line className="text-ix-muted text-xs" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-ix-accent/20 border border-ix-accent/30 flex items-center justify-center">
              <RiRobot2Line className="text-ix-accent text-xs" />
            </div>
            <div className="glass border border-ix-border rounded-xl rounded-bl-none px-3 py-2.5">
              <div className="flex gap-1 items-center h-4">
                {[0, 0.2, 0.4].map(d => (
                  <motion.div key={d}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: d }}
                    className="w-1.5 h-1.5 rounded-full bg-ix-accent" />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-ix-border flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              className="flex-shrink-0 text-[10px] font-mono text-ix-muted border border-ix-border px-2 py-1.5 rounded-lg hover:border-ix-accent/30 hover:text-ix-accent transition-all flex items-center gap-1">
              <RiSparklingLine className="text-[10px]" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-ix-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask anything about your data..."
          className="input flex-1 text-xs py-2 px-3" />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn-primary w-9 h-9 flex items-center justify-center p-0 rounded-xl flex-shrink-0 disabled:opacity-40">
          <RiSendPlane2Line className="text-sm" />
        </button>
      </div>
    </Wrapper>
  )
}