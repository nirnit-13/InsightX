# ⚡ InsightX — AI-Powered Contributor & Startup Analytics Dashboard

> A production-grade SaaS analytics platform for startups, hackathons, and contributor ecosystems. Turn contributor data into actionable intelligence — all in one platform.

![InsightX](https://img.shields.io/badge/InsightX-AI%20Analytics-6366f1?style=flat-square&logo=lightning&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.11-009688?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?style=flat-square)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat-square)
![AI](https://img.shields.io/badge/AI-Groq%20%C2%B7%20LLaMA%203.3%2070B-f97316?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-000000?style=flat-square)

---

## 🌐 Live Demo

> **🔗 <https://insight-x-neon.vercel.app/>**

Try the live deployment — no setup required. Use the demo accounts below or create your own.

| Role        | Email                  | Password    |
|-------------|------------------------|-------------|
| Admin       | admin@insightx.io      | admin123    |
| Contributor | sam@insightx.io        | pass123     |

---

## 🎬 Demo Video

> **▶️ <https://youtu.be/dIO0Iu6m_6A>**

---

## 📸 Screenshots

### Landing Page

![Landing Page](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Landing Page.png)

### Admin Dashboard

![Admin Dashboard](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Admin Dashboard.png)

### Admin Profile

![Admin Profile](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Admin Profile.png)

### Contributors Page

![Contributors Page](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Contributors Page.png)

### Contributor Dashboard

![Contributor Dashboard](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Contributor Dashboard.png)

### Contributor Profile

![Contributor Profile](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Contributor Profile.png)

### Tasks Page

![Tasks Page](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Tasks Page.png)

### My Tasks Page

![My Tasks Page](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/My Tasks Page.png)

### Leaderboard

![Leaderboard](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/Leaderboard.png)

### AI Reports Page

![AI Reports Page](https://github.com/nirnit-13/InsightX/raw/main/Screenshots/AI Reports Page.png)

---

## ✨ Features

### Core Platform

- 🔐 **JWT Authentication** — Register, login, persistent sessions with bcrypt password hashing
- 👥 **Role-Based Access Control** — Strict Admin vs Contributor role enforcement on both frontend routes and backend endpoints
- 📊 **Real-Time Dashboard** — Role-aware analytics: org-wide for admins, personal for contributors
- 🤖 **AI-Powered Insights** — Groq (LLaMA 3.3 70B) generates actionable summaries, anomaly alerts, and weekly reports
- 🏆 **Leaderboard** — Live rankings synced to the database; deletions reflect immediately
- 🌙 **Dark / Light Theme** — Glassmorphism UI with purple/cyan gradients, fully theme-aware charts
- 📱 **Fully Responsive** — Mobile, tablet, and desktop ready

### Contributor Management (Admin Only)

- Full CRUD for contributors with profiles, skills, streaks, GitHub/LinkedIn links
- Bulk import contributors via CSV upload (drag-and-drop)
- Export contributors list as CSV
- Team-based filtering (Frontend, Backend, Design, DevOps, Analytics)
- Productivity scores, attendance rates, and streak tracking per contributor

### Task Management

- Priority-based tasks (High, Medium, Low) with status pipeline (Pending → In Progress → Completed)
- Deadline tracking with overdue highlighting
- Admins manage all tasks; contributors see only their own tasks
- Search and filter by status, priority, and keyword
- Optimistic UI updates for instant status changes

### AI Reports & Insights

- **Live Insights Tab** — Real-time AI-generated analytics cards (productivity surges, anomalies, milestones)
- **Generate Reports Tab** — Weekly Summary, Productivity Report, Contributor Spotlight, Anomaly Detection
- **AI Chat Tab** — Conversational assistant that answers questions about your contributors and analytics
- Export reports as PDF or CSV

### UI/UX

- 🌙 **Dark/Light Mode** — Sophisticated dual-theme with smooth CSS variable transitions
- 💀 **Loading Skeletons** — Content-aware shimmer skeleton loaders throughout
- 🎨 **Animations** — Framer Motion throughout: page transitions, card hovers, stat pulses
- 🔔 **Notifications Panel** — Smart in-app notification system for deadlines, achievements, and attendance alerts
- 🔍 **Global Search** — Searchable topbar across contributors and tasks
- 🤖 **Floating AI Chat** — Persistent AI assistant accessible from any page via navbar

---

## 🏗️ Architecture

```
insightx/
├── src/                              # React frontend (Vite)
│   ├── components/
│   │   ├── ai/                       # AIInsightCard, AIChatAssistant, AIRecommendationsPanel
│   │   ├── charts/Charts.jsx         # Recharts wrappers (theme-aware)
│   │   ├── csv/CSVUploadModal.jsx    # Drag-and-drop CSV importer
│   │   ├── layout/AppLayout.jsx      # Sidebar + topbar + floating AI chat
│   │   ├── notifications/            # Real-time notification panel
│   │   ├── realtime/LiveComponents.jsx
│   │   └── ui/Components.jsx         # Reusable UI primitives
│   ├── context/
│   │   ├── AuthContext.jsx           # JWT auth + mock fallback
│   │   ├── NotificationsContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/mockData.js              # Fallback data (used when backend is unreachable)
│   ├── hooks/                        # useAnalytics, useTasks, useContributors, useRealTime
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx / Signup.jsx
│   │   ├── Dashboard.jsx             # Role-split: AdminDashboard / ContributorDashboard
│   │   ├── Contributors.jsx          # Admin-only CRUD
│   │   ├── Tasks.jsx                 # Role-aware task list
│   │   ├── Leaderboard.jsx           # Live-synced rankings
│   │   ├── Reports.jsx               # AI reports + chat (admin only)
│   │   └── Profile.jsx               # Per-user profile + task history
│   ├── providers/AppProviders.jsx    # QueryClient (no retry on 401/403)
│   └── services/api/                 # Axios client + per-resource API modules
│
└── server/                           # FastAPI backend
    └── app/
        ├── main.py                   # FastAPI app + CORS
        ├── database/mongodb.py       # Motor async MongoDB with retry + indexes
        ├── middleware/auth.py        # JWT bearer dependency
        ├── models/schemas.py         # Pydantic models
        ├── routes/
        │   ├── auth.py               # /auth/signup, /auth/login, /auth/me
        │   ├── contributors.py       # /contributors CRUD
        │   ├── tasks.py              # /tasks CRUD (role-aware)
        │   ├── analytics.py          # /analytics/overview, /charts, /leaderboard, /me
        │   ├── ai.py                 # /ai/insights, /ai/generate-report, /ai/chat
        │   └── reports.py            # /reports/* (PDF/CSV export, AI reports)
        ├── services/groq_service.py  # Centralized Groq AI service with retry logic
        └── utils/
            ├── permissions.py        # Role guards (admin_required, authenticated_required)
            └── security.py           # JWT encode/decode + bcrypt helpers
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/nirnit-13/InsightX.git
cd InsightX
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

### 3. Backend Setup

```bash
cd server
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/
JWT_SECRET=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
GROQ_API_KEY=gsk_...
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 4. Seed the Database (first run only)

```bash
# From project root (with venv active)
pip install bcrypt motor python-dotenv
python seed_db.py
```

> **Delete `seed_db.py` after running** — it contains no secrets but has no further use.

---

## ⚙️ Environment Variables

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:8000      # Backend URL
VITE_GROQ_API_KEY=gsk_...              # Optional: enables client-side AI in Reports page
```

### Backend (`server/.env`)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=<random 32+ char string>
GROQ_API_KEY=gsk_...

# Optional
DB_NAME=insightx
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
```

> **Never commit `server/.env`** — it is listed in `.gitignore`.

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint         | Description           | Auth         |
|--------|------------------|-----------------------|--------------|
| POST   | `/auth/signup`   | Register new user     | Public       |
| POST   | `/auth/login`    | Login → JWT token     | Public       |
| GET    | `/auth/me`       | Current user profile  | Required     |

### Contributors

| Method | Endpoint                  | Description              | Auth         |
|--------|---------------------------|--------------------------|--------------|
| GET    | `/contributors/`          | List all contributors    | Required     |
| POST   | `/contributors/`          | Add contributor          | Admin only   |
| PUT    | `/contributors/:id`       | Update contributor       | Admin only   |
| DELETE | `/contributors/:id`       | Remove contributor       | Admin only   |

### Tasks

| Method | Endpoint         | Description                        | Auth         |
|--------|------------------|------------------------------------|--------------|
| GET    | `/tasks/`        | All tasks (admin) / own tasks      | Required     |
| GET    | `/tasks/my`      | Tasks assigned to current user     | Required     |
| POST   | `/tasks/`        | Create task                        | Required     |
| PUT    | `/tasks/:id`     | Update task/status                 | Required     |
| DELETE | `/tasks/:id`     | Delete task                        | Admin only   |

### Analytics

| Method | Endpoint                     | Description               | Auth         |
|--------|------------------------------|---------------------------|--------------|
| GET    | `/analytics/overview`        | Dashboard stats           | Required     |
| GET    | `/analytics/me`              | Personal analytics        | Required     |
| GET    | `/analytics/charts`          | Chart data                | Required     |
| GET    | `/analytics/leaderboard`     | Ranked contributors       | Required     |

### AI & Reports

| Method | Endpoint                            | Description                  | Auth         |
|--------|-------------------------------------|------------------------------|--------------|
| POST   | `/ai/insights`                      | Generate AI insight          | Required     |
| POST   | `/ai/generate-report`               | Generate AI report           | Required     |
| POST   | `/ai/chat`                          | AI chat assistant            | Required     |
| POST   | `/reports/generate`                 | Full analytics report        | Admin only   |
| GET    | `/reports/export/csv/contributors`  | Export contributors CSV      | Admin only   |
| GET    | `/reports/export/csv/tasks`         | Export tasks CSV             | Admin only   |
| POST   | `/reports/export/pdf`               | Export report as PDF         | Admin only   |

---

## 🗄️ Database Schema

### Collections

**users**
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "role": "admin | contributor",
  "avatar": "string (initials)",
  "color": "string (hex)",
  "team": "string",
  "skills": ["string"],
  "github": "string",
  "linkedin": "string",
  "attendance": "number",
  "productivity_score": "number",
  "completed_tasks": "number",
  "streak": "number",
  "created_at": "datetime"
}
```

**tasks**
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "assigned_to": "string (user_id)",
  "deadline": "string (ISO date)",
  "tags": ["string"],
  "team": "string",
  "created_at": "datetime",
  "created_by": "string (user_id)"
}
```

**reports** — AI-generated report documents stored for history

---

## 🔧 Tech Stack

| Layer              | Technology                                        |
|--------------------|---------------------------------------------------|
| Frontend Framework | React 18 + Vite                                   |
| Styling            | Tailwind CSS 3.4 + CSS Variables (theme-aware)    |
| Animations         | Framer Motion 11                                  |
| Routing            | React Router 6                                    |
| State / Fetching   | TanStack React Query v5                           |
| HTTP Client        | Axios 1.7                                         |
| Charts             | Recharts 2.12 (dark/light theme-aware)            |
| Icons              | React Icons 5 (Remix Icon set)                    |
| Notifications      | React Hot Toast                                   |
| Backend Framework  | FastAPI 0.115                                     |
| ASGI Server        | Uvicorn 0.30                                      |
| Database           | MongoDB Atlas (Motor async driver)                |
| Authentication     | JWT (python-jose) + bcrypt (passlib)              |
| AI Model           | Groq API — LLaMA 3.3 70B                          |
| PDF Export         | ReportLab 4.2                                     |
| Deployment         | Vercel (frontend) + Render (backend)              |

---

## 🚢 Deployment Guide

### Frontend → Vercel

```bash
npm run build
# Push to GitHub and connect repo in Vercel dashboard
# Set VITE_API_URL env var to your backend URL
```

### Backend → Render / Railway

```
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables: MONGO_URI, JWT_SECRET, GROQ_API_KEY
```

### Database → MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist `0.0.0.0/0`
3. Copy the connection string to `MONGO_URI` in `server/.env`

---

## 🛠️ Development Tips

- API docs are available at `http://localhost:8000/docs` (Swagger UI)
- The frontend falls back to mock data for all demo accounts when the backend is unreachable — real CRUD operations require the backend running
- JWT tokens expire in 24 hours by default (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- React Query is configured with `retry: false` on 401/403 — auth errors don't trigger retry loops
- All MongoDB operations are async (Motor driver)
- Charts automatically adapt to dark/light mode via CSS variable reads at render time

---

## 📋 Known Limitations

- No email verification flow on register
- No 2FA support (architecture supports adding it)
- Groq free tier has rate limits; production use may require a paid plan
- WebSocket real-time updates are simulated on the frontend; the backend uses polling-based refresh
- PDF export requires `reportlab` installed on the backend server

---

## 🔮 Future Advancements

> These features are **not yet built** — they represent the roadmap for where InsightX is headed. None of these exist in the current version.

---

### 🔗 GitHub Integration — Sync Commits & PRs to InsightX Tasks

The most impactful planned advancement is a **native GitHub integration** that bridges your code activity directly with your InsightX contributor analytics. When your team pushes code, InsightX should know — automatically.

**What this would look like in practice:**

- A developer commits with a message like `fix: resolve auth bug [TASK-42]` → InsightX automatically marks Task #42 as *Completed* and increments the contributor's task count.
- A PR is opened on GitHub → the linked contributor's activity graph reflects it in real time.
- A PR is merged → the assignee receives an InsightX notification and their productivity score updates.
- The contributor profile shows a **"Linked Commits"** section — a live feed of every commit tied to that person.

**How it would be built (technical plan):**

- **GitHub Webhooks** — GitHub sends POST requests to `/api/v1/integrations/github/webhook` on every push, PR open/merge, and issue event.
- **Task keyword matching** — the backend parses commit messages for task references (e.g., `[TASK-42]`, `closes #42`) and updates the matched task automatically.
- **OAuth App** — users connect their GitHub account to InsightX via GitHub OAuth, allowing per-organization repo linking from the Settings page.
- **Activity log enrichment** — all GitHub events are stored and surfaced in the contributor profile and analytics dashboard.

---

### 🗺️ Other Planned Features

#### Authentication & Security

- [ ] **Email verification on registration** — OTP or magic link
- [ ] **Two-factor authentication (2FA)** — TOTP-based (Google Authenticator / Authy)
- [ ] **OAuth login** — Sign in with Google / GitHub
- [ ] **Session management** — View and revoke active sessions

#### Contributor Intelligence

- [ ] **Skill gap analysis** — AI-detected mismatches between task requirements and contributor skills
- [ ] **Burnout detection** — AI flags contributors with declining metrics over multiple weeks
- [ ] **Peer recognition system** — Contributors can award kudos to teammates
- [ ] **Contribution heatmap** — GitHub-style calendar showing daily activity

#### Tasks & Projects

- [ ] **Recurring tasks** — Daily / weekly / monthly task templates
- [ ] **Task dependencies** — Block a task until another is completed
- [ ] **Time tracking** — Log hours per task with a built-in timer
- [ ] **Subtasks** — Nested checklist inside a task
- [ ] **Gantt / Timeline view** — Visual project timeline alongside task list
- [ ] **Calendar view** — See tasks by due date in a monthly calendar

#### Analytics & Reporting

- [ ] **Scheduled reports** — Daily or weekly automated email digest of org analytics
- [ ] **Burndown charts** — Sprint progress visualization
- [ ] **Team comparison** — Side-by-side analytics across multiple teams
- [ ] **Custom KPI builder** — Admins define their own metrics and thresholds

#### Platform

- [ ] **Multi-organization support** — Switch between multiple orgs from one account
- [ ] **Public leaderboard page** — Shareable link for hackathon standings
- [ ] **Webhooks** — Notify external services when contributor milestones are hit
- [ ] **Mobile app** — React Native companion app

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © InsightX Team 2025

---

*Built with ❤️ using React, FastAPI, MongoDB, and Groq AI*