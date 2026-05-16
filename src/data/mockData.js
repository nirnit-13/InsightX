// Mock data for InsightX — simulates backend responses

export const CONTRIBUTORS = [
  { id: '1', name: 'Alex Rivera', email: 'alex@insightx.io', role: 'admin', avatar: 'AR', color: '#6366f1', skills: ['React', 'Node.js', 'TypeScript'], github: 'alexrivera', linkedin: 'alex-rivera', attendance: 96, productivity_score: 94, completed_tasks: 28, streak: 14, team: 'Frontend', joined: '2024-01-15' },
  { id: '2', name: 'Sam Chen', email: 'sam@insightx.io', role: 'contributor', avatar: 'SC', color: '#06b6d4', skills: ['Python', 'ML', 'FastAPI'], github: 'samchen', linkedin: 'sam-chen', attendance: 88, productivity_score: 82, completed_tasks: 21, streak: 7, team: 'Backend', joined: '2024-02-01' },
  { id: '3', name: 'Priya Nair', email: 'priya@insightx.io', role: 'contributor', avatar: 'PN', color: '#8b5cf6', skills: ['UI/UX', 'Figma', 'CSS'], github: 'priyanair', linkedin: 'priya-nair', attendance: 92, productivity_score: 89, completed_tasks: 25, streak: 11, team: 'Design', joined: '2024-01-20' },
  { id: '4', name: 'Jordan Lee', email: 'jordan@insightx.io', role: 'contributor', avatar: 'JL', color: '#10b981', skills: ['DevOps', 'Docker', 'K8s'], github: 'jordanlee', linkedin: 'jordan-lee', attendance: 79, productivity_score: 71, completed_tasks: 17, streak: 3, team: 'DevOps', joined: '2024-03-10' },
  { id: '5', name: 'Maria Santos', email: 'maria@insightx.io', role: 'contributor', avatar: 'MS', color: '#f59e0b', skills: ['Data Science', 'SQL', 'Power BI'], github: 'mariasantos', linkedin: 'maria-santos', attendance: 95, productivity_score: 91, completed_tasks: 30, streak: 18, team: 'Analytics', joined: '2024-01-05' },
  { id: '6', name: 'Dev Patel', email: 'dev@insightx.io', role: 'contributor', avatar: 'DP', color: '#ef4444', skills: ['Go', 'Redis', 'PostgreSQL'], github: 'devpatel', linkedin: 'dev-patel', attendance: 84, productivity_score: 77, completed_tasks: 19, streak: 5, team: 'Backend', joined: '2024-02-20' },
]

export const TASKS = [
  { id: 't1', title: 'Redesign Dashboard Landing', description: 'Revamp the main dashboard UI with new color system and layout', status: 'completed', priority: 'high', assigned_to: '1', team: 'Frontend', created_at: '2025-05-01', deadline: '2025-05-10', tags: ['UI', 'React'] },
  { id: 't2', title: 'API Rate Limiting Implementation', description: 'Add rate limiting middleware to all endpoints', status: 'in-progress', priority: 'high', assigned_to: '2', team: 'Backend', created_at: '2025-05-03', deadline: '2025-05-18', tags: ['FastAPI', 'Security'] },
  { id: 't3', title: 'ML Model Training Pipeline', description: 'Build automated retraining pipeline for recommendation model', status: 'in-progress', priority: 'medium', assigned_to: '2', team: 'Backend', created_at: '2025-05-05', deadline: '2025-05-25', tags: ['ML', 'Python'] },
  { id: 't4', title: 'Component Library Documentation', description: 'Document all reusable UI components with Storybook', status: 'pending', priority: 'low', assigned_to: '3', team: 'Design', created_at: '2025-05-06', deadline: '2025-05-30', tags: ['Docs', 'Figma'] },
  { id: 't5', title: 'CI/CD Pipeline Setup', description: 'Configure GitHub Actions for automated deployment', status: 'completed', priority: 'high', assigned_to: '4', team: 'DevOps', created_at: '2025-05-02', deadline: '2025-05-12', tags: ['DevOps', 'GitHub'] },
  { id: 't6', title: 'Analytics Data Pipeline', description: 'Build ETL pipeline for contributor activity data', status: 'completed', priority: 'high', assigned_to: '5', team: 'Analytics', created_at: '2025-05-01', deadline: '2025-05-08', tags: ['SQL', 'Python'] },
  { id: 't7', title: 'Database Query Optimization', description: 'Optimize slow queries identified in profiling session', status: 'in-progress', priority: 'medium', assigned_to: '6', team: 'Backend', created_at: '2025-05-07', deadline: '2025-05-20', tags: ['PostgreSQL', 'Performance'] },
  { id: 't8', title: 'Mobile Responsive Audit', description: 'Audit and fix mobile breakpoints across all pages', status: 'pending', priority: 'medium', assigned_to: '1', team: 'Frontend', created_at: '2025-05-08', deadline: '2025-05-22', tags: ['CSS', 'Mobile'] },
  { id: 't9', title: 'User Authentication Hardening', description: 'Add 2FA and session management improvements', status: 'pending', priority: 'high', assigned_to: '6', team: 'Backend', created_at: '2025-05-09', deadline: '2025-05-28', tags: ['Security', 'Auth'] },
  { id: 't10', title: 'Weekly Report Generator', description: 'Automate weekly performance reports via email', status: 'completed', priority: 'medium', assigned_to: '5', team: 'Analytics', created_at: '2025-05-01', deadline: '2025-05-07', tags: ['Python', 'Automation'] },
]

export const WEEKLY_ACTIVITY = [
  { day: 'Mon', commits: 24, tasks: 8, reviews: 12 },
  { day: 'Tue', commits: 31, tasks: 11, reviews: 9 },
  { day: 'Wed', commits: 18, tasks: 6, reviews: 14 },
  { day: 'Thu', commits: 42, tasks: 15, reviews: 18 },
  { day: 'Fri', commits: 35, tasks: 12, reviews: 10 },
  { day: 'Sat', commits: 14, tasks: 4, reviews: 5 },
  { day: 'Sun', commits: 8, tasks: 2, reviews: 3 },
]

export const MONTHLY_PRODUCTIVITY = [
  { month: 'Jan', score: 72, contributions: 145, attendance: 88 },
  { month: 'Feb', score: 76, contributions: 162, attendance: 90 },
  { month: 'Mar', score: 81, contributions: 178, attendance: 91 },
  { month: 'Apr', score: 79, contributions: 171, attendance: 89 },
  { month: 'May', score: 87, contributions: 194, attendance: 93 },
]

export const TEAM_DISTRIBUTION = [
  { name: 'Frontend', value: 28, color: '#6366f1' },
  { name: 'Backend', value: 35, color: '#8b5cf6' },
  { name: 'Design', value: 18, color: '#06b6d4' },
  { name: 'DevOps', value: 12, color: '#10b981' },
  { name: 'Analytics', value: 22, color: '#f59e0b' },
]

export const ENGAGEMENT_TREND = [
  { week: 'W1', engagement: 68, retention: 82, nps: 71 },
  { week: 'W2', engagement: 72, retention: 85, nps: 74 },
  { week: 'W3', engagement: 69, retention: 83, nps: 70 },
  { week: 'W4', engagement: 78, retention: 88, nps: 79 },
  { week: 'W5', engagement: 82, retention: 90, nps: 83 },
  { week: 'W6', engagement: 86, retention: 92, nps: 87 },
]

export const HEATMAP_DATA = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)
  return days.flatMap(day =>
    hours.map(hour => ({
      day, hour,
      value: Math.floor(Math.random() * 10)
    }))
  )
})()

export const OVERVIEW_STATS = {
  total_contributors: 6,
  active_users: 5,
  task_completion_rate: 68,
  weekly_productivity: 87,
  engagement_score: 83,
  attendance_avg: 89,
  total_tasks: 10,
  completed_tasks: 4,
  in_progress_tasks: 3,
  pending_tasks: 3,
  total_commits_week: 172,
  streak_avg: 9.7,
}

export const AI_INSIGHTS_CACHE = [
  {
    id: 'i1',
    type: 'performance',
    icon: '📈',
    title: 'Productivity Surge Detected',
    summary: 'Overall team productivity increased 12% this week. Maria Santos leads with a 94-point score, while Frontend and Analytics teams show the highest output velocity.',
    severity: 'positive',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'i2',
    type: 'anomaly',
    icon: '⚠️',
    title: 'Attendance Dip in DevOps',
    summary: 'Jordan Lee\'s attendance dropped to 79%, 13% below team average. Three consecutive missed stand-ups detected. Consider a 1:1 check-in to address blockers.',
    severity: 'warning',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'i3',
    type: 'recommendation',
    icon: '💡',
    title: 'Task Distribution Imbalance',
    summary: 'Backend team has 5 active tasks (50% of total load). Recommend redistributing 1-2 tasks to Design team who are currently underutilized at 18% load.',
    severity: 'info',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'i4',
    type: 'achievement',
    icon: '🏆',
    title: 'Milestone: 100+ Tasks Completed',
    summary: 'The team crossed 100 completed tasks this quarter. Maria Santos (30) and Alex Rivera (28) are the top contributors. Team velocity is on track for Q2 goals.',
    severity: 'positive',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
]