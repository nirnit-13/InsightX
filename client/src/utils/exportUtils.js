// ── Export Utilities for InsightX ─────────────────────────────────────────
// CSV via native Blob API (no extra dep)
// PDF via jsPDF (loaded dynamically)

import { CONTRIBUTORS, TASKS, OVERVIEW_STATS } from '../data/mockData'

// ── CSV Export ─────────────────────────────────────────────────────────────
function toCSV(headers, rows) {
  const escape = (val) => {
    const str = String(val ?? '')
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }
  const lines = [headers.join(','), ...rows.map(row => row.map(escape).join(','))]
  return lines.join('\n')
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportContributorsCSV() {
  const headers = ['Name', 'Email', 'Team', 'Role', 'Skills', 'Attendance (%)', 'Productivity Score', 'Tasks Completed', 'Streak (days)', 'GitHub', 'LinkedIn']
  const rows = CONTRIBUTORS.map(c => [
    c.name, c.email, c.team, c.role,
    Array.isArray(c.skills) ? c.skills.join('; ') : c.skills,
    c.attendance, c.productivity_score,
    c.completed_tasks, c.streak,
    c.github, c.linkedin,
  ])
  downloadCSV(`insightx-contributors-${today()}.csv`, toCSV(headers, rows))
}

export function exportTasksCSV() {
  const headers = ['Title', 'Description', 'Status', 'Priority', 'Team', 'Assigned To', 'Deadline', 'Tags', 'Created At']
  const rows = TASKS.map(t => {
    const assignee = CONTRIBUTORS.find(c => c.id === t.assigned_to)
    return [
      t.title, t.description, t.status, t.priority, t.team,
      assignee?.name || 'Unassigned',
      t.deadline || '—',
      Array.isArray(t.tags) ? t.tags.join('; ') : t.tags,
      t.created_at,
    ]
  })
  downloadCSV(`insightx-tasks-${today()}.csv`, toCSV(headers, rows))
}

export function exportLeaderboardCSV() {
  const sorted = [...CONTRIBUTORS].sort((a, b) => b.productivity_score - a.productivity_score)
  const headers = ['Rank', 'Name', 'Team', 'Productivity Score', 'Tasks Completed', 'Attendance (%)', 'Streak (days)']
  const rows = sorted.map((c, i) => [i + 1, c.name, c.team, c.productivity_score, c.completed_tasks, c.attendance, c.streak])
  downloadCSV(`insightx-leaderboard-${today()}.csv`, toCSV(headers, rows))
}

// ── PDF Export ─────────────────────────────────────────────────────────────
async function loadJsPDF() {
  // Dynamically import so it doesn't bloat initial bundle
  const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  return jsPDF
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export async function exportReportPDF(report) {
  try {
    const jsPDF = await loadJsPDF()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const W = 210
    const margin = 20
    let y = margin

    // ── Helpers ──
    const addText = (text, x, fontSize = 11, color = [241, 245, 249], bold = false) => {
      doc.setFontSize(fontSize)
      doc.setTextColor(...color)
      if (bold) doc.setFont('helvetica', 'bold')
      else doc.setFont('helvetica', 'normal')
      doc.text(String(text), x, y)
    }

    const nl = (amount = 7) => { y += amount }

    // Dark background
    doc.setFillColor(5, 8, 16)
    doc.rect(0, 0, W, 297, 'F')

    // Purple header band
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, W, 38, 'F')

    // Logo area
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('⚡ InsightX', margin, 16)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 200, 255)
    doc.text('AI-Powered Analytics Report', margin, 24)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 30)

    y = 50

    // Title
    addText(report?.title || 'Weekly Analytics Report', margin, 16, [241, 245, 249], true)
    nl(10)

    // Divider
    doc.setDrawColor(99, 102, 241)
    doc.setLineWidth(0.4)
    doc.line(margin, y, W - margin, y)
    nl(8)

    // Executive Summary
    addText('EXECUTIVE SUMMARY', margin, 8, [99, 102, 241], true)
    nl(6)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    const summaryLines = doc.splitTextToSize(report?.executive_summary || '', W - margin * 2)
    doc.text(summaryLines, margin, y)
    y += summaryLines.length * 5 + 8

    // Stats Grid
    const stats = [
      { label: 'Contributors', value: OVERVIEW_STATS.total_contributors },
      { label: 'Task Completion', value: `${OVERVIEW_STATS.task_completion_rate}%` },
      { label: 'Productivity', value: OVERVIEW_STATS.weekly_productivity },
      { label: 'Engagement', value: OVERVIEW_STATS.engagement_score },
    ]
    const boxW = (W - margin * 2 - 12) / 4
    stats.forEach((s, i) => {
      const x = margin + i * (boxW + 4)
      doc.setFillColor(17, 24, 39)
      doc.roundedRect(x, y, boxW, 18, 2, 2, 'F')
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(99, 102, 241)
      doc.text(String(s.value), x + boxW / 2, y + 9, { align: 'center' })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(s.label, x + boxW / 2, y + 15, { align: 'center' })
    })
    y += 26

    // Section helper
    const addSection = (title, items, bulletColor = [99, 102, 241], prefix = '•') => {
      if (!items?.length) return
      addText(title, margin, 8, [99, 102, 241], true)
      nl(6)
      items.forEach(item => {
        doc.setFillColor(...bulletColor)
        doc.circle(margin + 1.5, y - 1.5, 1, 'F')
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(203, 213, 225)
        const lines = doc.splitTextToSize(item, W - margin * 2 - 8)
        doc.text(lines, margin + 6, y)
        y += lines.length * 5 + 2
      })
      nl(5)
    }

    addSection('KEY HIGHLIGHTS', report?.highlights, [16, 185, 129])
    addSection('AREAS OF CONCERN', report?.concerns, [245, 158, 11])
    addSection('AI RECOMMENDATIONS', report?.recommendations, [99, 102, 241])

    // Forecast
    if (report?.forecast) {
      doc.setFillColor(17, 24, 39)
      doc.roundedRect(margin, y, W - margin * 2, 16, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(99, 102, 241)
      doc.text('OUTLOOK', margin + 4, y + 6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      const forecastLines = doc.splitTextToSize(report.forecast, W - margin * 2 - 8)
      doc.text(forecastLines, margin + 4, y + 11)
      y += 22
    }

    // Footer
    doc.setFillColor(17, 24, 39)
    doc.rect(0, 285, W, 12, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('InsightX — AI-Powered Contributor Analytics', margin, 292)
    doc.text(`© ${new Date().getFullYear()} InsightX`, W - margin, 292, { align: 'right' })

    doc.save(`insightx-report-${today()}.pdf`)
  } catch (err) {
    console.error('PDF export failed:', err)
    // Fallback: export as text file
    const content = [
      report?.title,
      '',
      'Executive Summary:',
      report?.executive_summary,
      '',
      'Highlights:',
      ...(report?.highlights?.map(h => `• ${h}`) || []),
      '',
      'Recommendations:',
      ...(report?.recommendations?.map(r => `→ ${r}`) || []),
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insightx-report-${today()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export function exportAnalyticsCSV() {
  const headers = ['Metric', 'Value']
  const rows = [
    ['Total Contributors', OVERVIEW_STATS.total_contributors],
    ['Active Users', OVERVIEW_STATS.active_users],
    ['Task Completion Rate (%)', OVERVIEW_STATS.task_completion_rate],
    ['Weekly Productivity Score', OVERVIEW_STATS.weekly_productivity],
    ['Engagement Score', OVERVIEW_STATS.engagement_score],
    ['Average Attendance (%)', OVERVIEW_STATS.attendance_avg],
    ['Total Tasks', OVERVIEW_STATS.total_tasks],
    ['Completed Tasks', OVERVIEW_STATS.completed_tasks],
    ['In Progress Tasks', OVERVIEW_STATS.in_progress_tasks],
    ['Pending Tasks', OVERVIEW_STATS.pending_tasks],
    ['Export Date', new Date().toISOString()],
  ]
  downloadCSV(`insightx-analytics-${today()}.csv`, toCSV(headers, rows))
}