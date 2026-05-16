from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, contributors, tasks, analytics, ai
from app.database.mongodb import connect_db, close_db

app = FastAPI(
    title="InsightX API",
    description="AI-Powered Contributor & Startup Analytics Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — update origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle
app.add_event_handler("startup", connect_db)
app.add_event_handler("shutdown", close_db)

# Routes
app.include_router(auth.router,         prefix="/auth",         tags=["Authentication"])
app.include_router(contributors.router, prefix="/contributors", tags=["Contributors"])
app.include_router(tasks.router,        prefix="/tasks",        tags=["Tasks"])
app.include_router(analytics.router,    prefix="/analytics",    tags=["Analytics"])
app.include_router(ai.router,           prefix="/ai",           tags=["AI Insights"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "InsightX API v1.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}