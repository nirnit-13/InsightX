"""
server/app/routes/analytics.py
RBAC-enforced analytics endpoints.

FIX — RBAC matrix applied:
  GET /analytics/overview    → admin: org stats | contributor: personal limited view
  GET /analytics/charts      → admin: org charts | contributor: personal charts only
  GET /analytics/leaderboard → ALL authenticated users (admin + contributor)
  GET /analytics/me          → contributor personal analytics (NEW endpoint)

Root cause of 403 loops: contributor dashboard was calling /analytics/overview
and /analytics/charts which were effectively admin-only. Now:
  - Contributors get a dedicated /analytics/me endpoint.
  - /analytics/charts returns role-filtered data.
  - /analytics/overview returns a limited personal view for contributors.
  - /analytics/leaderboard is open to all authenticated users.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database.mongodb import get_db
from app.utils.permissions import (
    authenticated_required,
    admin_required,
    is_admin,
    is_contributor,
)

router = APIRouter()


# ── GET /analytics/me ─────────────────────────────────────────────────────────
@router.get("/me")
async def get_my_analytics(current_user: dict = Depends(authenticated_required)):
    """
    Personal analytics for the currently authenticated user.

    FIX: This is the PRIMARY endpoint the contributor dashboard should call.
         It was missing entirely, causing the frontend to fall back to admin
         endpoints and receive 403 errors.

    Returns:
        assigned_tasks, completed_tasks, productivity stats, streaks,
        XP, completion_rate, personal chart data.
    """
    db      = get_db()
    user_id = current_user.get("sub") or current_user.get("id", "")

    # Fetch the user document from MongoDB
    try:
        user_doc = await db.users.find_one(
            {"_id": ObjectId(user_id)}, {"password": 0}
        )
    except Exception:
        user_doc = None

    if not user_doc:
        # Fallback: return stats from the JWT payload itself
        return {
            "user_id":         user_id,
            "email":           current_user.get("email"),
            "role":            current_user.get("role"),
            "productivity_score": 0,
            "attendance":      0,
            "completed_tasks": 0,
            "streak":          0,
            "assigned_tasks":  0,
            "in_progress_tasks": 0,
            "pending_tasks":   0,
            "completion_rate": 0,
            "xp":              0,
            "badges":          [],
            "personal_charts": [],
        }

    # Count tasks assigned to this user
    total_assigned = await db.tasks.count_documents({"assigned_to": user_id})
    completed      = await db.tasks.count_documents({"assigned_to": user_id, "status": "completed"})
    in_progress    = await db.tasks.count_documents({"assigned_to": user_id, "status": "in-progress"})
    pending        = await db.tasks.count_documents({"assigned_to": user_id, "status": "pending"})

    completion_rate = round((completed / total_assigned * 100), 1) if total_assigned else 0

    # Simple XP calculation: completed tasks × 10 + streak × 5
    streak = user_doc.get("streak", 0)
    xp     = completed * 10 + streak * 5

    # Derive badges
    badges = []
    if completed >= 10:
        badges.append("Task Master")
    if streak >= 7:
        badges.append(f"{streak}-Day Streak")
    if user_doc.get("productivity_score", 0) >= 90:
        badges.append("Top Performer")
    if user_doc.get("attendance", 0) >= 95:
        badges.append("Perfect Attendance")

    return {
        "user_id":            user_id,
        "email":              user_doc.get("email"),
        "name":               user_doc.get("name"),
        "role":               user_doc.get("role"),
        "productivity_score": user_doc.get("productivity_score", 0),
        "attendance":         user_doc.get("attendance", 0),
        "completed_tasks":    completed,
        "assigned_tasks":     total_assigned,
        "in_progress_tasks":  in_progress,
        "pending_tasks":      pending,
        "streak":             streak,
        "completion_rate":    completion_rate,
        "xp":                 xp,
        "badges":             badges,
        "team":               user_doc.get("team", "General"),
        "personal_charts":    [],   # reserved for future chart data
    }


# ── GET /analytics/overview ───────────────────────────────────────────────────
@router.get("/overview")
async def get_overview(current_user: dict = Depends(authenticated_required)):
    """
    Dashboard overview stats.

    FIX — Role-aware behaviour:
      Admin       → full organization-wide stats.
      Contributor → limited personal overview (avoids 403, avoids leaking org data).

    The contributor dashboard should prefer /analytics/me, but if it calls
    /analytics/overview it will now receive a safe personal subset instead of 403.
    """
    db = get_db()

    if is_admin(current_user):
        # ── Full org overview ──────────────────────────────────────────────
        total_contributors = await db.users.count_documents({})
        total_tasks        = await db.tasks.count_documents({})
        completed          = await db.tasks.count_documents({"status": "completed"})
        in_progress        = await db.tasks.count_documents({"status": "in-progress"})
        pending            = await db.tasks.count_documents({"status": "pending"})

        completion_rate = round((completed / total_tasks * 100), 1) if total_tasks else 0

        pipeline = [{"$group": {
            "_id": None,
            "avg_attendance":   {"$avg": "$attendance"},
            "avg_productivity": {"$avg": "$productivity_score"},
        }}]
        agg = await db.users.aggregate(pipeline).to_list(length=1)
        avg_attendance   = round(agg[0]["avg_attendance"],   1) if agg else 0
        avg_productivity = round(agg[0]["avg_productivity"], 1) if agg else 0

        return {
            "total_contributors":   total_contributors,
            "active_users":         max(0, total_contributors - 1),
            "task_completion_rate": completion_rate,
            "weekly_productivity":  avg_productivity,
            "engagement_score":     round(avg_productivity * 0.95, 1),
            "attendance_avg":       avg_attendance,
            "total_tasks":          total_tasks,
            "completed_tasks":      completed,
            "in_progress_tasks":    in_progress,
            "pending_tasks":        pending,
            "scope":                "organization",
        }

    # ── Personal limited overview (contributor) ────────────────────────────
    user_id = current_user.get("sub") or current_user.get("id", "")
    total   = await db.tasks.count_documents({"assigned_to": user_id})
    done    = await db.tasks.count_documents({"assigned_to": user_id, "status": "completed"})
    active  = await db.tasks.count_documents({"assigned_to": user_id, "status": "in-progress"})
    pend    = await db.tasks.count_documents({"assigned_to": user_id, "status": "pending"})

    try:
        user_doc = await db.users.find_one(
            {"_id": ObjectId(user_id)}, {"productivity_score": 1, "attendance": 1, "streak": 1}
        )
    except Exception:
        user_doc = {}

    completion_rate = round((done / total * 100), 1) if total else 0

    return {
        "total_contributors":   1,            # contributor sees only themselves
        "active_users":         1,
        "task_completion_rate": completion_rate,
        "weekly_productivity":  (user_doc or {}).get("productivity_score", 0),
        "engagement_score":     (user_doc or {}).get("productivity_score", 0),
        "attendance_avg":       (user_doc or {}).get("attendance", 0),
        "total_tasks":          total,
        "completed_tasks":      done,
        "in_progress_tasks":    active,
        "pending_tasks":        pend,
        "scope":                "personal",
    }


# ── GET /analytics/charts ─────────────────────────────────────────────────────
@router.get("/charts")
async def get_chart_data(current_user: dict = Depends(authenticated_required)):
    """
    Chart-ready analytics data.

    FIX — Role-aware behaviour:
      Admin       → organization-wide top contributors + team distribution.
      Contributor → personal task breakdown only (no org data leaked).

    Previously this endpoint returned org-wide data regardless of role,
    which is wrong even when contributors could access it.
    """
    db = get_db()

    if is_admin(current_user):
        # ── Org charts ─────────────────────────────────────────────────────
        top = await db.users.find(
            {}, {"name": 1, "completed_tasks": 1, "productivity_score": 1, "team": 1}
        ).sort("completed_tasks", -1).to_list(length=10)

        top_contributors = [
            {
                "name":  u["name"].split()[0],
                "tasks": u.get("completed_tasks", 0),
                "score": u.get("productivity_score", 0),
                "team":  u.get("team", "General"),
            }
            for u in top
        ]

        pipeline = [{"$group": {"_id": "$team", "count": {"$sum": 1}}}]
        team_agg = await db.users.aggregate(pipeline).to_list(length=20)
        team_distribution = [{"name": t["_id"] or "General", "value": t["count"]} for t in team_agg]

        return {
            "scope":             "organization",
            "top_contributors":  top_contributors,
            "team_distribution": team_distribution,
        }

    # ── Personal charts (contributor) ──────────────────────────────────────
    user_id = current_user.get("sub") or current_user.get("id", "")
    total   = await db.tasks.count_documents({"assigned_to": user_id})
    done    = await db.tasks.count_documents({"assigned_to": user_id, "status": "completed"})
    active  = await db.tasks.count_documents({"assigned_to": user_id, "status": "in-progress"})
    pend    = await db.tasks.count_documents({"assigned_to": user_id, "status": "pending"})

    personal_task_chart = [
        {"name": "Completed",   "value": done,   "color": "#10b981"},
        {"name": "In Progress", "value": active, "color": "#06b6d4"},
        {"name": "Pending",     "value": pend,   "color": "#f59e0b"},
    ]

    return {
        "scope":              "personal",
        "top_contributors":   [],              # not exposed to contributors
        "team_distribution":  [],
        "personal_task_chart": personal_task_chart,
        "total_tasks":        total,
    }


# ── GET /analytics/leaderboard ────────────────────────────────────────────────
@router.get("/leaderboard")
async def get_leaderboard(current_user: dict = Depends(authenticated_required)):
    """
    Public leaderboard — available to ALL authenticated users.

    FIX: Removed admin_required; leaderboard is a shared feature.
         Passwords are excluded from the response.
    """
    db    = get_db()
    users = await db.users.find(
        {}, {"password": 0}
    ).sort("productivity_score", -1).to_list(length=50)

    def serialize(u: dict) -> dict:
        u = dict(u)
        u["id"] = str(u.pop("_id"))
        return u

    return [serialize(u) for u in users]