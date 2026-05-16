"""
server/app/main.py
InsightX FastAPI application — production-ready entry point.
"""

import os
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import auth, contributors, tasks, analytics, ai
from app.routes import reports
from app.database.mongodb import connect_db, close_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="InsightX API",
    description=(
        "AI-Powered Contributor & Startup Analytics Platform.\n\n"
        "Provides RBAC-enforced CRUD for contributors and tasks, "
        "MongoDB-aggregated analytics, and Groq-powered AI insights."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# In production, add your Vercel / custom domain here via ALLOWED_ORIGINS env var
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["Content-Disposition"],   # needed for file downloads
    max_age=600,
)

# ── Startup / shutdown ────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup() -> None:
    """Validate env vars and connect to MongoDB."""
    _validate_env()
    await connect_db()
    logger.info("🚀 InsightX API v2.0.0 started successfully.")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_db()
    logger.info("InsightX API shut down cleanly.")


def _validate_env() -> None:
    """Warn (not crash) about missing optional keys at startup."""
    required = {"MONGO_URI": os.getenv("MONGO_URI"), "JWT_SECRET": os.getenv("JWT_SECRET")}
    for key, val in required.items():
        if not val:
            logger.critical("❌ Missing required environment variable: %s", key)
            raise EnvironmentError(f"Missing required env var: {key}")

    optional = {"GROQ_API_KEY": os.getenv("GROQ_API_KEY")}
    for key, val in optional.items():
        if not val:
            logger.warning("⚠️  Optional env var not set: %s (AI features will be disabled)", key)


# ── Global exception handlers ─────────────────────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc) -> JSONResponse:
    logger.error("Unhandled server error: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,         prefix="/auth",         tags=["Authentication"])
app.include_router(contributors.router, prefix="/contributors", tags=["Contributors"])
app.include_router(tasks.router,        prefix="/tasks",        tags=["Tasks"])
app.include_router(analytics.router,    prefix="/analytics",    tags=["Analytics"])
app.include_router(ai.router,           prefix="/ai",           tags=["AI Insights"])
app.include_router(reports.router,      prefix="/reports",      tags=["Reports"])


# ── Health endpoints ──────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {"status": "ok", "service": "InsightX API", "version": "2.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    """Lightweight health check for uptime monitoring."""
    return {
        "status":  "healthy",
        "version": "2.0.0",
        "groq":    bool(os.getenv("GROQ_API_KEY")),
        "mongo":   bool(os.getenv("MONGO_URI")),
    }