from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime

from app.database.mongodb import get_db
from app.models.schemas import SignupRequest, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user

router = APIRouter()


def _force_str_role(role) -> str:
    """Convert any role representation to a plain string."""
    if hasattr(role, "value"):       # Pydantic/Python Enum
        return role.value
    if isinstance(role, str):
        return role
    return str(role)


def serialize_user(user: dict) -> dict:
    """Convert a MongoDB user document to a safe, serializable dict."""
    user = dict(user)
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)
    # FIX: always coerce role to a plain string
    user["role"] = _force_str_role(user.get("role", "contributor"))
    return user


def build_token(user: dict) -> str:
    """Build a JWT from a serialized (no-password) user dict."""
    # FIX: explicitly coerce role here too — belt-and-suspenders
    role = _force_str_role(user.get("role", "contributor"))
    return create_access_token({
        "sub":   user["id"],
        "id":    user["id"],
        "email": user["email"],
        "role":  role,            # guaranteed plain string
    })


# ── POST /auth/signup ─────────────────────────────────────────────────────────
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    db = get_db()

    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    initials = "".join(w[0].upper() for w in payload.name.split()[:2])
    colors   = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    color    = colors[len(payload.email) % len(colors)]

    # FIX: always store role as a plain string in MongoDB
    role_str = _force_str_role(payload.role)

    doc = {
        "name":               payload.name,
        "email":              payload.email,
        "password":           hash_password(payload.password),
        "role":               role_str,   # ← plain string, not Enum
        "avatar":             initials,
        "color":              color,
        "team":               "General",
        "skills":             [],
        "github":             "",
        "linkedin":           "",
        "attendance":         100.0,
        "productivity_score": 75.0,
        "completed_tasks":    0,
        "streak":             0,
        "created_at":         datetime.utcnow().isoformat(),
    }

    result  = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    user    = serialize_user(doc)
    token   = build_token(user)

    return {"access_token": token, "token_type": "bearer", "user": user}


# ── POST /auth/login ──────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
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
    Return the currently authenticated user's full profile.
    FIX: returns full user data so AuthContext can refresh stale localStorage.
    """
    db      = get_db()
    user_id = current_user.get("sub") or current_user.get("id", "")

    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if user_doc:
            return serialize_user(user_doc)
    except Exception:
        pass

    # Fallback: return JWT payload fields
    return {
        "id":    user_id,
        "email": current_user.get("email"),
        "role":  _force_str_role(current_user.get("role", "contributor")),
        "sub":   user_id,
    }