"""
Temporary seed route — DELETE THIS FILE after seeding.
Access: POST /seed/init
"""
import bcrypt
from fastapi import APIRouter
from app.database.mongodb import get_db
from datetime import datetime

router = APIRouter()

USERS = [
    {
        "name": "Alex Rivera", "email": "admin@insightx.io",
        "password": "admin123", "role": "admin",
        "avatar": "AR", "color": "#6366f1", "team": "Frontend",
        "skills": ["React", "Node.js", "TypeScript"],
        "github": "alexrivera", "linkedin": "alex-rivera",
        "attendance": 96.0, "productivity_score": 94.0,
        "completed_tasks": 28, "streak": 14,
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "name": "Sam Chen", "email": "sam@insightx.io",
        "password": "pass123", "role": "contributor",
        "avatar": "SC", "color": "#06b6d4", "team": "Backend",
        "skills": ["Python", "ML", "FastAPI"],
        "github": "samchen", "linkedin": "sam-chen",
        "attendance": 88.0, "productivity_score": 82.0,
        "completed_tasks": 21, "streak": 7,
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "name": "Priya Nair", "email": "priya@insightx.io",
        "password": "priya123", "role": "contributor",
        "avatar": "PN", "color": "#8b5cf6", "team": "Design",
        "skills": ["UI/UX", "Figma", "CSS"],
        "github": "priyanair", "linkedin": "priya-nair",
        "attendance": 92.0, "productivity_score": 89.0,
        "completed_tasks": 25, "streak": 11,
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "name": "Jordan Lee", "email": "jordan@insightx.io",
        "password": "jordan123", "role": "contributor",
        "avatar": "JL", "color": "#10b981", "team": "DevOps",
        "skills": ["DevOps", "Docker", "K8s"],
        "github": "jordanlee", "linkedin": "jordan-lee",
        "attendance": 79.0, "productivity_score": 71.0,
        "completed_tasks": 17, "streak": 3,
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "name": "Maria Santos", "email": "maria@insightx.io",
        "password": "maria123", "role": "contributor",
        "avatar": "MS", "color": "#f59e0b", "team": "Analytics",
        "skills": ["Data Science", "SQL", "Power BI"],
        "github": "mariasantos", "linkedin": "maria-santos",
        "attendance": 95.0, "productivity_score": 91.0,
        "completed_tasks": 30, "streak": 18,
        "created_at": datetime.utcnow().isoformat(),
    },
    {
        "name": "Dev Patel", "email": "dev@insightx.io",
        "password": "dev123", "role": "contributor",
        "avatar": "DP", "color": "#ef4444", "team": "Backend",
        "skills": ["Go", "Redis", "PostgreSQL"],
        "github": "devpatel", "linkedin": "dev-patel",
        "attendance": 84.0, "productivity_score": 77.0,
        "completed_tasks": 19, "streak": 5,
        "created_at": datetime.utcnow().isoformat(),
    },
]

@router.post("/init")
async def seed_database():
    db = get_db()
    created = []
    skipped = []

    for user in USERS:
        existing = await db.users.find_one({"email": user["email"]})
        if existing:
            skipped.append(user["email"])
            continue

        data = dict(user)
        raw_password = data.pop("password")
        hashed = bcrypt.hashpw(
            raw_password.encode(), bcrypt.gensalt()
        ).decode()
        data["password"] = hashed

        await db.users.insert_one(data)
        created.append(user["email"])

    return {
        "status": "done",
        "created": created,
        "skipped": skipped,
    }