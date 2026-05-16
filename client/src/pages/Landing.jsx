import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiFlashlightLine, RiArrowRightLine, RiGithubLine, RiBarChartBoxLine, RiTeamLine, RiBrainLine, RiShieldCheckLine, RiRocketLine } from 'react-icons/ri'

const FEATURES = [
  { icon: RiBarChartBoxLine, color: '#6366f1', title: 'Real-Time Analytics', desc: 'Live dashboards with contributor metrics, productivity scores, and engagement heatmaps.' },
  { icon: RiBrainLine, color: '#8b5cf6', title: 'AI-Powered Insights', desc: 'Claude AI generates actionable summaries, anomaly alerts, and performance recommendations.' },
  { icon: RiTeamLine, color: '#06b6d4', title: 'Contributor Intelligence', desc: 'Track individual and team performance with rich profiles, streaks, and skill matrices.' },
  { icon: RiShieldCheckLine, color: '#10b981', title: 'Secure & Scalable', desc: 'JWT authentication, role-based access, and MongoDB-backed scalable architecture.' },
  { icon: RiRocketLine, color: '#f59e0b', title: 'Task Management', desc: 'Lightweight task tracking with priority levels, deadlines, and status pipelines.' },
  { icon: RiGithubLine, color: '#ef4444', title: 'Dev Ecosystem Ready', desc: 'Integrates with GitHub workflows and exports PDF/CSV reports for stakeholder briefings.' },
]

const STATS = [
  { value: '10K+', label: 'Contributors Tracked' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '48ms', label: 'Avg Response Time' },
  { value: '50+', label: 'AI Insight Types' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-ix-bg overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-ix-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-ix-cyan/8 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-ix-border/50 glass">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ix-accent to-ix-accent2 flex items-center justify-center shadow-glow-sm">
            <RiFlashlightLine className="text-white text-base" />
          </div>
          <span className="font-display font-bold text-ix-text text-lg tracking-tight">InsightX</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-6 lg:px-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ix-accent/30 bg-ix-accent/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-ix-accent animate-pulse" />
            <span className="text-xs font-mono text-ix-accent">AI-Powered Analytics Platform</span>
          </div>

          <h1 className="font-display font-bold text-5xl lg:text-7xl text-ix-text leading-tight mb-6 max-w-5xl mx-auto">
            Turn Contributor Data Into{' '}
            <span className="text-gradient">Actionable Intelligence</span>
          </h1>

          <p className="text-ix-muted text-lg lg:text-xl font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            InsightX is the AI analytics command center for startups, hackathons, and contributor ecosystems.
            Track performance, surface insights, and drive growth — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                Launch Dashboard <RiArrowRightLine />
              </motion.button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost flex items-center gap-2 text-base px-8 py-4">
                <span className="text-ix-muted">Try with demo</span>
                <span className="text-xs font-mono text-ix-accent border border-ix-accent/30 px-2 py-0.5 rounded">admin@insightx.io</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto">
          <div className="glass border border-ix-border rounded-2xl p-1 shadow-card">
            <div className="bg-ix-surface rounded-xl p-6 relative overflow-hidden">
              {/* Mock Dashboard UI */}
              <div className="flex items-center gap-2 mb-6">
                {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
                <div className="flex-1 h-6 glass rounded-lg ml-2 flex items-center px-3">
                  <span className="text-[10px] font-mono text-ix-muted">insightx.io/dashboard</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Contributors', val: '6', color: '#6366f1' },
                  { label: 'Task Rate', val: '68%', color: '#10b981' },
                  { label: 'Engagement', val: '83', color: '#06b6d4' },
                  { label: 'Productivity', val: '87', color: '#8b5cf6' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass rounded-xl p-3">
                    <div className="w-6 h-6 rounded-lg mb-2" style={{ backgroundColor: `${s.color}20` }} />
                    <p className="text-base font-display font-bold text-ix-text">{s.val}</p>
                    <p className="text-[10px] text-ix-muted">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Mock chart bars */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 60, 90, 55, 75, 85, 70, 95, 78].map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                      className="flex-1 rounded-t-sm"
                      style={{ background: `linear-gradient(180deg, #6366f1${i % 3 === 0 ? '' : '80'}, #8b5cf640)` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 px-6 lg:px-16 border-y border-ix-border/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <p className="font-display font-bold text-3xl text-gradient mb-1">{s.value}</p>
              <p className="text-xs text-ix-muted font-body">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ix-text mb-4">
            Everything you need to{' '}
            <span className="text-gradient">manage your ecosystem</span>
          </h2>
          <p className="text-ix-muted text-base max-w-xl mx-auto">
            From individual contributor tracking to org-wide analytics, InsightX has your team covered.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 border border-ix-border hover:border-ix-accent/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                <f.icon className="text-xl" style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-semibold text-ix-text mb-2">{f.title}</h3>
              <p className="text-sm text-ix-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12 border border-ix-accent/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ix-accent/10 to-ix-accent2/10" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl text-ix-text mb-4">Ready to unlock your team's potential?</h2>
            <p className="text-ix-muted mb-8">Join the platform built for modern contributor ecosystems.</p>
            <Link to="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-4">
                Start for free <RiArrowRightLine />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ix-border py-8 px-6 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <RiFlashlightLine className="text-ix-accent" />
          <span className="font-display font-semibold text-ix-text text-sm">InsightX</span>
          <span className="text-ix-muted text-xs">— AI Contributor Analytics</span>
        </div>
        <p className="text-xs text-ix-muted font-mono">© 2025 InsightX. Built with React + FastAPI + Claude AI</p>
      </footer>
    </div>
  )
}