import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(13,17,23,0.95)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '12px',
    fontFamily: 'DM Sans',
  },
  labelStyle: { color: '#94a3b8', fontFamily: 'DM Sans' }
}

// ── Area Chart ─────────────────────────────────────────────────────────────
export function GradientAreaChart({ data, lines, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {lines.map((line, i) => (
            <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color || colors[i]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={line.color || colors[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        {lines.map((line, i) => (
          <Area key={line.key} type="monotone" dataKey={line.key}
            stroke={line.color || colors[i]} strokeWidth={2}
            fill={`url(#grad-${line.key})`}
            name={line.label || line.key} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Bar Chart ──────────────────────────────────────────────────────────────
export function ActivityBarChart({ data, bars, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={bars.length > 1 ? 10 : 20}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'DM Sans', color: '#64748b' }} />}
        {bars.map((bar, i) => (
          <Bar key={bar.key} dataKey={bar.key} fill={bar.color || colors[i]}
            radius={[4, 4, 0, 0]} name={bar.label || bar.key} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Line Chart ─────────────────────────────────────────────────────────────
export function TrendLineChart({ data, lines, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'DM Sans', color: '#64748b' }} />}
        {lines.map((line, i) => (
          <Line key={line.key} type="monotone" dataKey={line.key}
            stroke={line.color || colors[i]} strokeWidth={2.5}
            dot={{ fill: line.color || colors[i], r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name={line.label || line.key} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Donut Chart ────────────────────────────────────────────────────────────
export function DonutChart({ data, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={88}
          paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE.contentStyle}
          formatter={(value, name) => [value, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Mini Sparkline ─────────────────────────────────────────────────────────
export function Sparkline({ data, dataKey, color = '#6366f1', height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          fill={`url(#spark-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}