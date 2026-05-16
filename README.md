# ⚡ InsightX — AI-Powered Contributor & Startup Analytics Dashboard

> A production-grade SaaS analytics platform for startups, hackathons, and contributor ecosystems.

![InsightX Banner](https://img.shields.io/badge/InsightX-AI%20Analytics-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Claude AI](https://img.shields.io/badge/Claude-AI%20Powered-orange?style=flat-square)

---

## 🚀 Features

- **📊 Real-Time Dashboard** — Contributor metrics, productivity scores, engagement heatmaps
- **🤖 AI-Powered Insights** — Claude/Groq/Gemini generates actionable summaries, anomaly alerts
- **👥 Contributor Management** — Full CRUD with profiles, skills, streaks, GitHub/LinkedIn links
- **📋 Task Management** — Priority-based tasks with status pipeline and deadline tracking
- **🏆 Leaderboard** — Dynamic rankings with medals, badges, and performance tiers
- **📝 AI Report Generator** — Weekly reports, productivity summaries, downloadable insights
- **💬 AI Chat Assistant** — Ask anything about your contributors and analytics
- **🌙 Dark Theme** — Glassmorphism UI with purple/cyan gradients
- **📱 Fully Responsive** — Mobile, tablet, and desktop ready

---

## 🗂️ Project Structure

```
insightx/
├── src/                          # React frontend (Vite)
│   ├── components/
│   │   ├── charts/Charts.jsx     # Recharts wrappers
│   │   ├── layout/AppLayout.jsx  # Sidebar + topbar
│   │   └── ui/Components.jsx     # Reusable UI components
│   ├── context/AuthContext.jsx   # JWT auth state
│   ├── data/mockData.js          # Mock analytics data
│   ├── pages/
│   │   ├── Landing.jsx           # Marketing landing page
│   │   ├── Login.jsx / Signup.jsx
│   │   ├── Dashboard.jsx         # Main analytics dashboard
│   │   ├── Contributors.jsx      # Contributor CRUD
│   │   ├── Tasks.jsx             # Task management
│   │   ├── Leaderboard.jsx       # Rankings
│   │   ├── Reports.jsx           # AI reports + chat
│   │   └── Profile.jsx           # User profile
│   └── services/api.js           # Axios + Claude API calls
│
└── server/                       # FastAPI backend
    └── app/
        ├── main.py               # FastAPI app + CORS
        ├── database/mongodb.py   # Motor async MongoDB
        ├── models/schemas.py     # Pydantic models
        ├── routes/
        │   ├── auth.py           # /auth/signup, /auth/login
        │   ├── contributors.py   # /contributors CRUD
        │   ├── tasks.py          # /tasks CRUD
        │   ├── analytics.py      # /analytics/overview, /charts
        │   └── ai.py             # /ai/insights, /ai/generate-report
        └── utils/auth.py         # JWT + bcrypt helpers
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)
- Groq API key (free at [console.groq.com](https://console.groq.com)) **or** Gemini API key

---

### 1. Frontend Setup

```bash
# From project root
npm install
cp .env.example .env        # Edit VITE_API_URL if needed
npm run dev                 # http://localhost:5173
```

---

### 2. Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env         # Fill in MONGO_URI, JWT_SECRET, AI keys
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

### 3. Demo Login (Frontend — works without backend)

| Role        | Email                 | Password   |
|-------------|----------------------|------------|
| Admin       | admin@insightx.io    | admin123   |
| Contributor | sam@insightx.io      | pass123    |

> The frontend uses mock data by default — no backend required for demo!

---

## 🌐 Deployment

### Frontend → Vercel
```bash
npm run build
# Deploy /dist to Vercel or push to GitHub + connect Vercel
# Set VITE_API_URL env var in Vercel dashboard
```

### Backend → Render / Railway
```bash
# Start command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Add environment variables in Render/Railway dashboard:
# MONGO_URI, JWT_SECRET, GROQ_API_KEY (or GEMINI_API_KEY)
```

### Database → MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user, whitelist `0.0.0.0/0`
3. Copy connection string to `MONGO_URI`

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description            | Auth     |
|--------|-----------------------------|------------------------|----------|
| POST   | `/auth/signup`              | Register new user      | Public   |
| POST   | `/auth/login`               | Login → JWT token      | Public   |
| GET    | `/contributors/`            | List all contributors  | Required |
| POST   | `/contributors/`            | Add contributor        | Admin    |
| PUT    | `/contributors/:id`         | Update contributor     | Admin    |
| DELETE | `/contributors/:id`         | Remove contributor     | Admin    |
| GET    | `/tasks/`                   | List tasks (filtered)  | Required |
| POST   | `/tasks/`                   | Create task            | Required |
| PUT    | `/tasks/:id`                | Update task/status     | Required |
| DELETE | `/tasks/:id`                | Delete task            | Admin    |
| GET    | `/analytics/overview`       | Dashboard stats        | Required |
| GET    | `/analytics/charts`         | Chart data             | Required |
| GET    | `/analytics/leaderboard`    | Ranked contributors    | Required |
| POST   | `/ai/insights`              | Generate AI insight    | Required |
| POST   | `/ai/generate-report`       | Generate AI report     | Required |
| POST   | `/ai/chat`                  | AI chat assistant      | Required |

---

## 🎨 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts     | Recharts                                |
| Icons      | React Icons (Remix Icon set)            |
| Backend    | FastAPI, Uvicorn                        |
| Database   | MongoDB Atlas (Motor async driver)      |
| Auth       | JWT (python-jose) + bcrypt              |
| AI         | Claude API / Groq (LLaMA3) / Gemini    |
| Deployment | Vercel (FE) + Render/Railway (BE)       |

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