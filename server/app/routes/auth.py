from fastapi import APIRouter, HTTPException, status
from app.database.mongodb import get_db
from app.models.schemas import SignupRequest, LoginRequest, TokenResponse
from app.utils.auth import hash_password, verify_password, create_access_token
from bson import ObjectId
from datetime import datetime
import re

router = APIRouter()


def serialize_user(user: dict) -> dict:
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)
    return user


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    db = get_db()
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    initials = "".join(w[0].upper() for w in payload.name.split()[:2])
    colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    color = colors[len(initials) % len(colors)]

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hash_password(payload.password),
        "role": payload.role,
        "avatar": initials,
        "color": color,
        "team": "General",
        "skills": [],
        "github": "",
        "linkedin": "",
        "attendance": 100.0,
        "productivity_score": 75.0,
        "completed_tasks": 0,
        "streak": 0,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    user = serialize_user(doc)
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = serialize_user(user)
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {"access_token": token, "user": user}


@router.get("/me")
async def me(current_user: dict = None):
    # Protected via middleware in real use
    return current_user