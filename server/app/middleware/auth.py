"""
server/app/middleware/auth.py
Single source of truth for FastAPI authentication dependencies.

FIX: get_current_user() now always returns a dict with { sub, email, role, id }
     so every route and permission helper can rely on these fields being present.
     Invalid / expired tokens are rejected with clear 401 responses.
"""

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.utils.security import decode_access_token

# ── Bearer scheme ─────────────────────────────────────────────────────────────
security = HTTPBearer(auto_error=True)


# ── Core token validator ──────────────────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency — validates the Bearer JWT and returns the decoded payload.

    FIX: Returns a normalized dict that always contains:
        {
            "sub":   "<user_id>",
            "id":    "<user_id>",   ← same as sub, for frontend/route convenience
            "email": "<email>",
            "role":  "admin" | "contributor",
        }

    Raises:
        HTTPException 401 — missing, expired, or malformed token.
        HTTPException 401 — token payload missing 'sub'.
    """
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Validate 'sub' is present
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject (sub)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Normalize: ensure 'id' and 'role' are always available
    payload.setdefault("id",   user_id)
    payload.setdefault("role", "contributor")

    return payload   # { sub, id, email, role, exp, iat }


# ── Role extraction helper ────────────────────────────────────────────────────
def extract_role(current_user: dict) -> str:
    """Return the role string from a decoded JWT payload (safe default)."""
    return current_user.get("role", "contributor")


# ── Admin-only guard ──────────────────────────────────────────────────────────
async def admin_required(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    FastAPI dependency — allows ONLY admin users.

    FIX: Raises 403 (not 401) when authenticated but insufficiently privileged.

    Raises:
        HTTPException 403 — if user role is not 'admin'.
    """
    if extract_role(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ── Contributor-or-admin guard ────────────────────────────────────────────────
async def require_contributor_or_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    FastAPI dependency — allows both contributors and admins.

    Raises:
        HTTPException 403 — for any other role.
    """
    if extract_role(current_user) not in ("admin", "contributor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Contributor or Admin access required",
        )
    return current_user


# ── Optional auth (does NOT raise if token absent) ───────────────────────────
optional_security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
) -> dict | None:
    """
    Same as get_current_user but returns None instead of raising when no token
    is supplied.  Useful for public endpoints with optional personalization.
    """
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        payload.setdefault("id",   payload.get("sub", ""))
        payload.setdefault("role", "contributor")
        return payload
    except JWTError:
        return None