"""
server/app/routes/auth.py
Authentication routes — signup, login, and /me.

FIX: Login and signup responses now return:
  {
    "access_token": "...",
    "token_type":   "bearer",
    "user": {
        "id":    "...",
        "email": "...",
        "role":  "admin" | "contributor",
        ... (all non-sensitive user fields)
    }
  }

This guarantees the frontend receives the role on every auth response,
preventing the RBAC desynchronization that caused repeated 403 loops.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime

from app.database.mongodb import get_db
from app.models.schemas import SignupRequest, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user

router = APIRouter()


def serialize_user(user: dict) -> dict:
    """
    Convert a MongoDB user document to a safe, serializable dict.
    Removes password and converts ObjectId → str.
    """
    user = dict(user)
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)

    # Ensure role is always a plain string (not an Enum)
    if hasattr(user.get("role"), "value"):
        user["role"] = user["role"].value

    return user


def build_token(user: dict) -> str:
    """Build a JWT from a serialized (no-password) user dict."""
    return create_access_token({
        "sub":   user["id"],
        "id":    user["id"],
        "email": user["email"],
        "role":  user.get("role", "contributor"),
    })


# ── POST /auth/signup ─────────────────────────────────────────────────────────
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    """
    Register a new user.

    Returns the JWT and a full user object (including role) so the
    frontend can initialize its auth state immediately.
    """
    db = get_db()

    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Build avatar initials + deterministic color
    initials = "".join(w[0].upper() for w in payload.name.split()[:2])
    colors   = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    color    = colors[len(payload.email) % len(colors)]

    role_value = payload.role.value if hasattr(payload.role, "value") else payload.role

    doc = {
        "name":              payload.name,
        "email":             payload.email,
        "password":          hash_password(payload.password),
        "role":              role_value,
        "avatar":            initials,
        "color":             color,
        "team":              "General",
        "skills":            [],
        "github":            "",
        "linkedin":          "",
        "attendance":        100.0,
        "productivity_score": 75.0,
        "completed_tasks":   0,
        "streak":            0,
        "created_at":        datetime.utcnow().isoformat(),
    }

    result  = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    user    = serialize_user(doc)
    token   = build_token(user)

    return {"access_token": token, "token_type": "bearer", "user": user}


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Authenticate a user and return a JWT.

    FIX: The response 'user' object always contains the 'role' field
         so the frontend can persist it to localStorage immediately
         and avoid a second /auth/me round-trip.
    """
    db   = get_db()
    user = await db.users.find_one({"email": payload.email})

    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    user  = serialize_user(user)
    token = build_token(user)

    return {"access_token": token, "token_type": "bearer", "user": user}


# ── GET /auth/me ──────────────────────────────────────────────────────────────
@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    """
    Return the currently authenticated user's JWT payload.
    Clients can call this to verify their session and refresh user data.
    """
    return {
        "id":    current_user.get("id") or current_user.get("sub"),
        "email": current_user.get("email"),
        "role":  current_user.get("role", "contributor"),
        "sub":   current_user.get("sub"),
    }