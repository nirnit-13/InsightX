from fastapi import APIRouter, Depends
from app.database.mongodb import get_db
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/overview")
async def get_overview(current_user=Depends(get_current_user)):
    db = get_db()

    total_contributors = await db.users.count_documents({})
    total_tasks        = await db.tasks.count_documents({})
    completed          = await db.tasks.count_documents({"status": "completed"})
    in_progress        = await db.tasks.count_documents({"status": "in-progress"})
    pending            = await db.tasks.count_documents({"status": "pending"})

    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks else 0

    # Aggregate average attendance & productivity
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_attendance":   {"$avg": "$attendance"},
            "avg_productivity": {"$avg": "$productivity_score"},
        }}
    ]
    agg = await db.users.aggregate(pipeline).to_list(length=1)
    avg_attendance   = round(agg[0]["avg_attendance"], 1)   if agg else 0
    avg_productivity = round(agg[0]["avg_productivity"], 1) if agg else 0

    return {
        "total_contributors":  total_contributors,
        "active_users":        max(0, total_contributors - 1),
        "task_completion_rate": completion_rate,
        "weekly_productivity": avg_productivity,
        "engagement_score":    round(avg_productivity * 0.95, 1),
        "attendance_avg":      avg_attendance,
        "total_tasks":         total_tasks,
        "completed_tasks":     completed,
        "in_progress_tasks":   in_progress,
        "pending_tasks":       pending,
    }


@router.get("/charts")
async def get_chart_data(current_user=Depends(get_current_user)):
    """Returns processed chart-ready data."""
    db = get_db()

    # Top contributors by completed_tasks
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

    # Team distribution
    pipeline = [
        {"$group": {"_id": "$team", "count": {"$sum": 1}}}
    ]
    team_agg = await db.users.aggregate(pipeline).to_list(length=20)
    team_distribution = [{"name": t["_id"], "value": t["count"]} for t in team_agg]

    return {
        "top_contributors":  top_contributors,
        "team_distribution": team_distribution,
    }


@router.get("/leaderboard")
async def get_leaderboard(current_user=Depends(get_current_user)):
    db = get_db()
    users = await db.users.find(
        {}, {"password": 0}
    ).sort("productivity_score", -1).to_list(length=50)

    def serialize(u):
        u["id"] = str(u.pop("_id"))
        return u

    return [serialize(u) for u in users]