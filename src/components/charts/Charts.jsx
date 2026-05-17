/**
 * src/components/charts/Charts.jsx
 *
 * FIX: All hardcoded dark colors replaced with CSS variable reads so
 * charts display correctly in BOTH dark and light mode.
 * - Axis tick color reads from CSS variable via getComputedStyle
 * - Tooltip styles adapt per theme
 * - Grid lines adapt per theme
 * - DonutChart legend bars use border color from CSS var (not bg-white/5)
 */

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Read CSS variable at render time so it responds to theme ──────────────
function cssVar(name) {
  if (typeof window === 'undefined') return '#64748b'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#64748b'
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

// ── Theme-aware tooltip styles ─────────────────────────────────────────────
function getTooltipStyle() {
  const dark = isDarkMode()
  return {
    contentStyle: {
      background: dark ? 'rgba(13, 17, 23, 0.97)' : 'rgba(255, 255, 255, 0.98)',
      border: `1px solid ${dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
      borderRadius: '12px',
      color: dark ? '#f1f5f9' : '#0f172a',
      fontSize: '12px',
      fontFamily: 'DM Sans, sans-serif',
      padding: '10px 14px',
      boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
    },
    labelStyle: {
      color: dark ? '#94a3b8' : '#64748b',
      fontFamily: 'DM Sans, sans-serif',
      marginBottom: '4px',
    },
    itemStyle: {
      color: dark ? '#f1f5f9' : '#0f172a',
      fontFamily: 'DM Sans, sans-serif',
    },
    cursor: { fill: 'rgba(99,102,241,0.06)' },
  }
}

// ── Theme-aware axis tick ──────────────────────────────────────────────────
function getAxisTick() {
  return {
    fill: isDarkMode() ? '#64748b' : '#94a3b8',
    fontSize: 11,
    fontFamily: 'DM Sans, sans-serif',
  }
}

// ── Theme-aware grid stroke ────────────────────────────────────────────────
function getGridStroke() {
  return isDarkMode() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
}

// ── Area Chart ─────────────────────────────────────────────────────────────
export function GradientAreaChart({ data, lines, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
  const tooltip = getTooltipStyle()
  const axisTick = getAxisTick()
  const gridStroke = getGridStroke()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {lines.map((line, i) => (
            <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={line.color || colors[i]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={line.color || colors[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltip.contentStyle}
          labelStyle={tooltip.labelStyle}
          itemStyle={tooltip.itemStyle}
          cursor={{ fill: 'rgba(99,102,241,0.06)' }}
        />
        {lines.map((line, i) => (
          <Area
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color || colors[i]}
            strokeWidth={2}
            fill={`url(#grad-${line.key})`}
            name={line.label || line.key}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: line.color || colors[i] }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Bar Chart ──────────────────────────────────────────────────────────────
export function ActivityBarChart({ data, bars, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981']
  const tooltip = getTooltipStyle()
  const axisTick = getAxisTick()
  const gridStroke = getGridStroke()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barSize={bars.length > 1 ? 8 : 16}
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltip.contentStyle}
          labelStyle={tooltip.labelStyle}
          itemStyle={tooltip.itemStyle}
          cursor={{ fill: 'rgba(99,102,241,0.06)' }}
        />
        {bars.length > 1 && (
          <Legend
            wrapperStyle={{
              fontSize: '11px',
              fontFamily: 'DM Sans, sans-serif',
              color: isDarkMode() ? '#64748b' : '#94a3b8',
              paddingTop: '8px',
            }}
          />
        )}
        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={bar.color || colors[i]}
            radius={[3, 3, 0, 0]}
            name={bar.label || bar.key}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Line Chart ─────────────────────────────────────────────────────────────
export function TrendLineChart({ data, lines, height = 220 }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
  const tooltip = getTooltipStyle()
  const axisTick = getAxisTick()
  const gridStroke = getGridStroke()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltip.contentStyle}
          labelStyle={tooltip.labelStyle}
          itemStyle={tooltip.itemStyle}
          cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }}
        />
        {lines.length > 1 && (
          <Legend
            wrapperStyle={{
              fontSize: '11px',
              fontFamily: 'DM Sans, sans-serif',
              color: isDarkMode() ? '#64748b' : '#94a3b8',
              paddingTop: '8px',
            }}
          />
        )}
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color || colors[i]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: line.color || colors[i] }}
            name={line.label || line.key}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Donut Chart ────────────────────────────────────────────────────────────
export function DonutChart({ data, height = 200 }) {
  const tooltip = getTooltipStyle()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={82}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltip.contentStyle}
          labelStyle={tooltip.labelStyle}
          itemStyle={tooltip.itemStyle}
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
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}