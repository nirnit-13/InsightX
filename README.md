# ⚡ InsightX — AI-Powered Contributor & Startup Analytics Dashboard

> A production-grade SaaS analytics platform for startups, hackathons, and contributor ecosystems.

![InsightX Banner](https://img.shields.io/badge/InsightX-AI%20Analytics-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-orange?style=flat-square)

---

## 🚀 Features

- **📊 Real-Time Dashboard** — Role-aware analytics: org-wide for admins, personal for contributors
- **🤖 AI-Powered Insights** — Groq (LLaMA 3.3 70B) generates actionable summaries, anomaly alerts, and weekly reports
- **👥 Contributor Management** — Full CRUD with profiles, skills, streaks, GitHub/LinkedIn links (admin only)
- **📋 Task Management** — Priority-based tasks with status pipeline and deadline tracking; contributors see only their own tasks
- **🏆 Leaderboard** — Live rankings synced to the database; deletions reflect immediately
- **📝 AI Report Generator** — Weekly, productivity, anomaly, and contributor-spotlight reports with PDF/CSV export
- **💬 AI Chat Assistant** — Ask anything about your contributors and analytics (Groq-powered)
- **🌙 Dark / Light Theme** — Glassmorphism UI with purple/cyan gradients, fully theme-aware charts
- **📱 Fully Responsive** — Mobile, tablet, and desktop ready
- **🔐 Role-Based Access** — Admin vs Contributor roles enforced on both frontend routes and backend endpoints

---

## 🗂️ Project Structure

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

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)
- Groq API key — free at [console.groq.com](https://console.groq.com)

---

### 1. Clone & install frontend

```bash
npm install
npm run dev        # http://localhost:5173
```

---

### 2. Backend setup

```bash
cd server
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create `server/.env` (never commit this file):

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

---

### 3. Seed the database (first run only)

The database starts empty. Run the seed script once to insert demo users and tasks:

```bash
# From project root (with venv active or bcrypt/motor installed globally)
pip install bcrypt motor python-dotenv
python seed_db.py
```

**Delete `seed_db.py` after running** — it contains no secrets but has no further use.

---

### 4. Demo accounts

| Role        | Email                  | Password    |
|-------------|------------------------|-------------|
| Admin       | admin@insightx.io      | admin123    |
| Contributor | sam@insightx.io        | pass123     |
| Contributor | priya@insightx.io      | priya123    |
| Contributor | jordan@insightx.io     | jordan123   |
| Contributor | maria@insightx.io      | maria123    |
| Contributor | dev@insightx.io        | dev123      |

> **Without a backend:** The frontend falls back to mock data for all demo accounts automatically. Real CRUD operations (add/delete contributors, create tasks) require the backend running.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
npm run build
# Push to GitHub, connect repo in Vercel dashboard
# Set VITE_API_URL env var to your backend URL
```

### Backend → Render / Railway
```
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables: MONGO_URI, JWT_SECRET, GROQ_API_KEY
```

### Database → MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user, whitelist `0.0.0.0/0`
3. Copy the connection string to `MONGO_URI` in `server/.env`

---

## 🔌 API Endpoints

| Method | Endpoint                       | Description                   | Auth         |
|--------|--------------------------------|-------------------------------|--------------|
| POST   | `/auth/signup`                 | Register new user             | Public       |
| POST   | `/auth/login`                  | Login → JWT token             | Public       |
| GET    | `/auth/me`                     | Current user profile          | Required     |
| GET    | `/contributors/`               | List all contributors         | Required     |
| POST   | `/contributors/`               | Add contributor               | Admin only   |
| PUT    | `/contributors/:id`            | Update contributor            | Admin only   |
| DELETE | `/contributors/:id`            | Remove contributor            | Admin only   |
| GET    | `/tasks/`                      | All tasks (admin) / own tasks | Required     |
| GET    | `/tasks/my`                    | Tasks assigned to current user| Required     |
| POST   | `/tasks/`                      | Create task                   | Required     |
| PUT    | `/tasks/:id`                   | Update task/status            | Required     |
| DELETE | `/tasks/:id`                   | Delete task                   | Admin only   |
| GET    | `/analytics/overview`          | Dashboard stats               | Required     |
| GET    | `/analytics/me`                | Personal analytics            | Required     |
| GET    | `/analytics/charts`            | Chart data                    | Required     |
| GET    | `/analytics/leaderboard`       | Ranked contributors           | Required     |
| POST   | `/ai/insights`                 | Generate AI insight           | Required     |
| POST   | `/ai/generate-report`          | Generate AI report            | Required     |
| POST   | `/ai/chat`                     | AI chat assistant             | Required     |
| POST   | `/reports/generate`            | Full analytics report         | Admin only   |
| GET    | `/reports/export/csv/contributors` | Export contributors CSV   | Admin only   |
| GET    | `/reports/export/csv/tasks`    | Export tasks CSV              | Admin only   |
| POST   | `/reports/export/pdf`          | Export report as PDF          | Admin only   |

---

## 🎨 Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion       |
| Charts     | Recharts (theme-aware dark/light mode)            |
| Icons      | React Icons (Remix Icon set)                      |
| State      | TanStack React Query v5 (no retry on 401/403)     |
| Backend    | FastAPI, Uvicorn                                  |
| Database   | MongoDB Atlas (Motor async driver)                |
| Auth       | JWT (python-jose) + bcrypt                        |
| AI         | Groq API — LLaMA 3.3 70B                          |
| Deployment | Vercel (frontend) + Render/Railway (backend)      |

---

## 🔑 Environment Variables

### Frontend (`.env` in project root)
```env
VITE_API_URL=http://localhost:8000   # Backend URL
VITE_GROQ_API_KEY=gsk_...            # Optional: enables client-side AI in Reports page
```

### Backend (`server/.env`)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=<random 32+ char string>
GROQ_API_KEY=gsk_...
# Optional:
DB_NAME=insightx
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
```

> **Never commit `server/.env`** — it is listed in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT © InsightX Team 2025