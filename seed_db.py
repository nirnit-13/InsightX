"""
seed_db.py — Run this ONCE to insert demo users into MongoDB.
Usage: cd server && python ../seed_db.py

Or from project root: python seed_db.py
"""
import asyncio, os, sys
from datetime import datetime
from pathlib import Path

# ── Make sure server/ is on the path ─────────────────────────────────────────
ROOT = Path(__file__).parent
SERVER = ROOT / "server"
sys.path.insert(0, str(SERVER))

from dotenv import load_dotenv
load_dotenv(SERVER / ".env")

import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME   = os.getenv("DB_NAME", "insightx")

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

DEMO_USERS = [
    {
        "name":               "Alex Rivera",
        "email":              "admin@insightx.io",
        "password":           hash_password("admin123"),
        "role":               "admin",
        "avatar":             "AR",
        "color":              "#6366f1",
        "team":               "Frontend",
        "skills":             ["React", "Node.js", "Python"],
        "github":             "alexrivera",
        "linkedin":           "alex-rivera",
        "attendance":         96.0,
        "productivity_score": 94.0,
        "completed_tasks":    28,
        "streak":             14,
        "created_at":         datetime.utcnow().isoformat(),
    },
    {
        "name":               "Sam Chen",
        "email":              "sam@insightx.io",
        "password":           hash_password("pass123"),
        "role":               "contributor",
        "avatar":             "SC",
        "color":              "#06b6d4",
        "team":               "Backend",
        "skills":             ["Python", "ML", "FastAPI"],
        "github":             "samchen",
        "linkedin":           "sam-chen",
        "attendance":         88.0,
        "productivity_score": 82.0,
        "completed_tasks":    21,
        "streak":             7,
        "created_at":         datetime.utcnow().isoformat(),
    },
    {
        "name":               "Priya Nair",
        "email":              "priya@insightx.io",
        "password":           hash_password("priya123"),
        "role":               "contributor",
        "avatar":             "PN",
        "color":              "#8b5cf6",
        "team":               "Design",
        "skills":             ["UI/UX", "Figma", "CSS"],
        "github":             "priyanair",
        "linkedin":           "priya-nair",
        "attendance":         92.0,
        "productivity_score": 89.0,
        "completed_tasks":    25,
        "streak":             11,
        "created_at":         datetime.utcnow().isoformat(),
    },
    {
        "name":               "Jordan Lee",
        "email":              "jordan@insightx.io",
        "password":           hash_password("jordan123"),
        "role":               "contributor",
        "avatar":             "JL",
        "color":              "#10b981",
        "team":               "DevOps",
        "skills":             ["DevOps", "Docker", "K8s"],
        "github":             "jordanlee",
        "linkedin":           "jordan-lee",
        "attendance":         79.0,
        "productivity_score": 71.0,
        "completed_tasks":    17,
        "streak":             3,
        "created_at":         datetime.utcnow().isoformat(),
    },
    {
        "name":               "Maria Santos",
        "email":              "maria@insightx.io",
        "password":           hash_password("maria123"),
        "role":               "contributor",
        "avatar":             "MS",
        "color":              "#f59e0b",
        "team":               "Analytics",
        "skills":             ["Data Science", "SQL", "Power BI"],
        "github":             "mariasantos",
        "linkedin":           "maria-santos",
        "attendance":         95.0,
        "productivity_score": 91.0,
        "completed_tasks":    30,
        "streak":             18,
        "created_at":         datetime.utcnow().isoformat(),
    },
    {
        "name":               "Dev Patel",
        "email":              "dev@insightx.io",
        "password":           hash_password("dev123"),
        "role":               "contributor",
        "avatar":             "DP",
        "color":              "#ef4444",
        "team":               "Backend",
        "skills":             ["Go", "Redis", "PostgreSQL"],
        "github":             "devpatel",
        "linkedin":           "dev-patel",
        "attendance":         84.0,
        "productivity_score": 77.0,
        "completed_tasks":    19,
        "streak":             5,
        "created_at":         datetime.utcnow().isoformat(),
    },
]


async def seed():
    if not MONGO_URI:
        print("❌  MONGO_URI not set. Add it to server/.env")
        return

    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=8000)
    db     = client[DB_NAME]

    inserted = skipped = 0
    for user in DEMO_USERS:
        existing = await db.users.find_one({"email": user["email"]})
        if existing:
            print(f"  ⚠️  {user['email']} already exists — skipping")
            skipped += 1
        else:
            await db.users.insert_one(user)
            print(f"  ✅  Inserted {user['email']} (role: {user['role']})")
            inserted += 1

    client.close()
    print(f"\nDone — {inserted} inserted, {skipped} skipped.")
    if inserted == 0 and skipped == len(DEMO_USERS):
        print("All demo users already exist — database is ready.")


if __name__ == "__main__":
    asyncio.run(seed())