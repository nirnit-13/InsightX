"""
InsightX — Reports Router
Endpoints for generating, summarizing, and exporting analytics reports.
All AI summaries use the centralized Groq service.
"""

import io
import json
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.database.mongodb import get_db
from app.middleware.auth import get_current_user, require_admin
from app.services.groq_service import (
    generate_weekly_report,
    generate_productivity_summary,
    generate_operational_alerts,
    generate_report_summary,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _today_str() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")


async def _fetch_analytics_snapshot(db) -> dict:
    """Pull a full analytics snapshot from MongoDB for report generation."""
    total_contributors = await db.users.count_documents({})
    total_tasks        = await db.tasks.count_documents({})
    completed          = await db.tasks.count_documents({"status": "completed"})
    in_progress        = await db.tasks.count_documents({"status": "in-progress"})
    pending            = await db.tasks.count_documents({"status": "pending"})
    overdue            = await db.tasks.count_documents({
        "status": {"$ne": "completed"},
        "deadline": {"$lt": datetime.utcnow().isoformat()},
    })

    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks else 0

    agg = await db.users.aggregate([
        {"$group": {
            "_id": None,
            "avg_attendance":   {"$avg": "$attendance"},
            "avg_productivity": {"$avg": "$productivity_score"},
            "avg_streak":       {"$avg": "$streak"},
        }}
    ]).to_list(length=1)

    avg_attendance   = round(agg[0]["avg_attendance"],   1) if agg else 0
    avg_productivity = round(agg[0]["avg_productivity"], 1) if agg else 0
    avg_streak       = round(agg[0]["avg_streak"],       1) if agg else 0

    top_contributors = await db.users.find(
        {}, {"name": 1, "productivity_score": 1, "completed_tasks": 1, "team": 1, "streak": 1}
    ).sort("productivity_score", -1).to_list(length=5)

    return {
        "total_contributors":  total_contributors,
        "total_tasks":         total_tasks,
        "completed_tasks":     completed,
        "in_progress_tasks":   in_progress,
        "pending_tasks":       pending,
        "overdue_tasks":       overdue,
        "task_completion_rate": completion_rate,
        "avg_attendance":      avg_attendance,
        "avg_productivity":    avg_productivity,
        "avg_streak":          avg_streak,
        "top_contributors": [
            {
                "name":  c["name"],
                "score": c.get("productivity_score", 0),
                "tasks": c.get("completed_tasks", 0),
                "team":  c.get("team", ""),
                "streak": c.get("streak", 0),
            }
            for c in top_contributors
        ],
        "generated_at": datetime.utcnow().isoformat(),
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/overview")
async def get_reports_overview(admin=Depends(require_admin)):
    """Return a summary of available report types and the latest snapshot."""
    db = get_db()
    snapshot = await _fetch_analytics_snapshot(db)
    return {
        "available_reports": [
            {"id": "weekly",       "label": "Weekly Summary",       "description": "Full team performance for the week"},
            {"id": "productivity", "label": "Productivity Report",   "description": "Productivity analysis with recommendations"},
            {"id": "contributor",  "label": "Contributor Spotlight", "description": "Individual contributor breakdown"},
            {"id": "anomaly",      "label": "Anomaly Detection",     "description": "Detect unusual patterns in data"},
        ],
        "snapshot": snapshot,
    }


@router.post("/generate")
async def generate_report(
    payload: dict,
    admin=Depends(require_admin),
):
    """
    Generate an AI-powered analytics report using Groq.

    Body:
        report_type (str): weekly | productivity | contributor | anomaly
        extra_context (dict, optional): additional data to include
    """
    report_type   = payload.get("report_type", "weekly")
    extra_context = payload.get("extra_context", {})

    db       = get_db()
    snapshot = await _fetch_analytics_snapshot(db)
    data     = {**snapshot, "report_type": report_type, **extra_context}

    try:
        if report_type == "weekly":
            result = await generate_weekly_report(data)
        elif report_type == "productivity":
            result = await generate_productivity_summary(data)
        elif report_type == "anomaly":
            result = await generate_operational_alerts(data)
        else:
            result = await generate_report_summary(data)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return {
        "report_type": report_type,
        "generated_at": datetime.utcnow().isoformat(),
        "snapshot": snapshot,
        "ai_report": result,
    }


@router.post("/contributor-summary/{contributor_id}")
async def generate_contributor_report(
    contributor_id: str,
    admin=Depends(require_admin),
):
    """Generate an AI-powered summary for a specific contributor."""
    from bson import ObjectId
    db = get_db()

    try:
        oid = ObjectId(contributor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contributor ID")

    contributor = await db.users.find_one({"_id": oid}, {"password": 0})
    if not contributor:
        raise HTTPException(status_code=404, detail="Contributor not found")

    # Count their tasks
    total_tasks     = await db.tasks.count_documents({"assigned_to": contributor_id})
    completed_tasks = await db.tasks.count_documents({"assigned_to": contributor_id, "status": "completed"})
    overdue_tasks   = await db.tasks.count_documents({
        "assigned_to": contributor_id,
        "status": {"$ne": "completed"},
        "deadline": {"$lt": datetime.utcnow().isoformat()},
    })

    contributor_data = {
        "name":              contributor.get("name"),
        "team":              contributor.get("team"),
        "productivity_score": contributor.get("productivity_score", 0),
        "attendance":        contributor.get("attendance", 0),
        "streak":            contributor.get("streak", 0),
        "total_tasks":       total_tasks,
        "completed_tasks":   completed_tasks,
        "overdue_tasks":     overdue_tasks,
        "skills":            contributor.get("skills", []),
    }

    from app.services.groq_service import generate_contributor_insight
    try:
        insight = await generate_contributor_insight(contributor_data)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return {
        "contributor": contributor_data,
        "ai_insight":  insight,
        "generated_at": datetime.utcnow().isoformat(),
    }


# ── CSV Export ────────────────────────────────────────────────────────────────

@router.get("/export/csv/contributors")
async def export_contributors_csv(admin=Depends(require_admin)):
    """Export all contributors as a CSV file."""
    db = get_db()
    contributors = await db.users.find({}, {"password": 0}).to_list(length=500)

    lines = ["Name,Email,Team,Role,Productivity Score,Attendance,Tasks Completed,Streak,Skills"]
    for c in contributors:
        skills = ";".join(c.get("skills", []))
        lines.append(
            f"{c.get('name','')},{c.get('email','')},{c.get('team','')},{c.get('role','')},"
            f"{c.get('productivity_score',0)},{c.get('attendance',0)},"
            f"{c.get('completed_tasks',0)},{c.get('streak',0)},{skills}"
        )

    csv_content = "\n".join(lines)
    return StreamingResponse(
        io.BytesIO(csv_content.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=contributors-{_today_str()}.csv"},
    )


@router.get("/export/csv/tasks")
async def export_tasks_csv(admin=Depends(require_admin)):
    """Export all tasks as a CSV file."""
    db = get_db()
    tasks = await db.tasks.find({}).to_list(length=1000)

    lines = ["Title,Status,Priority,Team,Assigned To,Deadline,Created At,Tags"]
    for t in tasks:
        tags = ";".join(t.get("tags", []))
        lines.append(
            f"{t.get('title','')},{t.get('status','')},{t.get('priority','')},"
            f"{t.get('team','')},{t.get('assigned_to','N/A')},{t.get('deadline','')},"
            f"{t.get('created_at','')},{tags}"
        )

    csv_content = "\n".join(lines)
    return StreamingResponse(
        io.BytesIO(csv_content.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=tasks-{_today_str()}.csv"},
    )


@router.get("/export/csv/analytics")
async def export_analytics_csv(admin=Depends(require_admin)):
    """Export analytics overview as a CSV file."""
    db = get_db()
    snapshot = await _fetch_analytics_snapshot(db)

    lines = ["Metric,Value"]
    for key, val in snapshot.items():
        if key not in ("top_contributors", "generated_at"):
            lines.append(f"{key.replace('_', ' ').title()},{val}")

    lines.append("")
    lines.append("Top Contributors")
    lines.append("Name,Score,Tasks,Team,Streak")
    for c in snapshot.get("top_contributors", []):
        lines.append(f"{c['name']},{c['score']},{c['tasks']},{c['team']},{c['streak']}")

    csv_content = "\n".join(lines)
    return StreamingResponse(
        io.BytesIO(csv_content.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=analytics-{_today_str()}.csv"},
    )


# ── PDF Export ────────────────────────────────────────────────────────────────

@router.post("/export/pdf")
async def export_report_pdf(
    payload: dict,
    admin=Depends(require_admin),
):
    """
    Generate a PDF from an AI report using ReportLab.

    Body:
        report (dict): The AI report dict (title, executive_summary, highlights, etc.)
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.colors import HexColor, white, black
        from reportlab.lib.units import mm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer,
            Table, TableStyle, HRFlowable,
        )
        from reportlab.lib.enums import TA_LEFT, TA_CENTER
    except ImportError:
        raise HTTPException(status_code=503, detail="reportlab not installed — run: pip install reportlab")

    report = payload.get("report", {})
    snapshot = payload.get("snapshot", {})

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
    )

    # ── Styles ──
    ACCENT   = HexColor("#6366f1")
    DARK_BG  = HexColor("#111827")
    MUTED    = HexColor("#94a3b8")
    TEXT     = HexColor("#f1f5f9")
    GREEN    = HexColor("#10b981")
    AMBER    = HexColor("#f59e0b")
    RED      = HexColor("#ef4444")

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=TEXT,    fontSize=20, spaceAfter=4)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=ACCENT,  fontSize=11, spaceAfter=6, spaceBefore=14)
    body = ParagraphStyle("Body", parent=styles["Normal"], textColor=MUTED, fontSize=10, leading=15)
    bullet_style = ParagraphStyle("Bullet", parent=body, leftIndent=12, bulletIndent=0)

    elements = []

    # ── Header ──
    elements.append(Paragraph("⚡ InsightX", h1))
    elements.append(Paragraph("AI-Powered Analytics Report", ParagraphStyle("sub", parent=body, textColor=ACCENT, fontSize=9)))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%B %d, %Y')}", body))
    elements.append(HRFlowable(width="100%", color=ACCENT, thickness=0.5, spaceAfter=10))

    # ── Title ──
    title = report.get("title", "Weekly Analytics Report")
    elements.append(Paragraph(title, ParagraphStyle("Title", parent=h1, fontSize=16, textColor=TEXT)))
    elements.append(Spacer(1, 8))

    # ── Stats table ──
    if snapshot:
        stats_data = [
            ["Total Contributors", str(snapshot.get("total_contributors", "—"))],
            ["Task Completion",    f"{snapshot.get('task_completion_rate', '—')}%"],
            ["Avg Productivity",   str(snapshot.get("avg_productivity", "—"))],
            ["Avg Attendance",     f"{snapshot.get('avg_attendance', '—')}%"],
        ]
        tbl = Table(stats_data, colWidths=[80 * mm, 50 * mm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), DARK_BG),
            ("TEXTCOLOR",  (0, 0), (-1, -1), MUTED),
            ("TEXTCOLOR",  (1, 0), (1, -1), ACCENT),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#111827"), HexColor("#0d1117")]),
            ("GRID",       (0, 0), (-1, -1), 0.25, HexColor("#1f2937")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING",  (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(tbl)
        elements.append(Spacer(1, 12))

    # ── Sections ──
    def add_section(heading: str, items: list, color=GREEN, prefix="✓"):
        if not items:
            return
        elements.append(Paragraph(heading, h2))
        for item in items:
            elements.append(Paragraph(f"{prefix}  {item}", bullet_style))
        elements.append(Spacer(1, 6))

    exec_summary = report.get("executive_summary", "")
    if exec_summary:
        elements.append(Paragraph("Executive Summary", h2))
        elements.append(Paragraph(exec_summary, body))
        elements.append(Spacer(1, 6))

    add_section("Key Highlights",     report.get("highlights", []),       GREEN, "✓")
    add_section("Areas of Concern",   report.get("concerns", []),         AMBER, "⚠")
    add_section("AI Recommendations", report.get("recommendations", []),  ACCENT, "→")

    forecast = report.get("forecast", "")
    if forecast:
        elements.append(Paragraph("Outlook", h2))
        elements.append(Paragraph(forecast, body))

    # ── Footer ──
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", color=HexColor("#1f2937"), thickness=0.5))
    elements.append(Paragraph(
        f"InsightX — AI-Powered Analytics Platform · © {datetime.utcnow().year}",
        ParagraphStyle("footer", parent=body, fontSize=8, textColor=HexColor("#4b5563"), alignment=TA_CENTER),
    ))

    doc.build(elements)
    buf.seek(0)

    filename = f"insightx-report-{_today_str()}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )