from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from app.utils.security import decode_access_token

# ── Bearer scheme ────────────────────────────────────────────────────────────
security = HTTPBearer(auto_error=True)


# ── Core token validator ─────────────────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency — validates the Bearer JWT and returns the decoded payload.

    Raises:
        HTTPException 401: Missing, expired, or malformed token.
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

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload  # contains: sub, email, role, exp, iat


# ── Role extraction helper ───────────────────────────────────────────────────
def extract_role(current_user: dict) -> str:
    """Return the role string from a decoded JWT payload."""
    return current_user.get("role", "contributor")


# ── Admin guard ──────────────────────────────────────────────────────────────
async def require_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    FastAPI dependency — allows only admin users.

    Raises:
        HTTPException 403: If user role is not 'admin'.
    """
    if extract_role(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ── Contributor-or-admin guard ───────────────────────────────────────────────
async def require_contributor_or_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Allows contributors and admins; blocks any other role."""
    role = extract_role(current_user)
    if role not in ("admin", "contributor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Contributor or Admin access required",
        )
    return current_user


# ── Optional auth (no error if missing) ──────────────────────────────────────
optional_security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
) -> dict | None:
    """
    Same as get_current_user but returns None instead of raising if no token.
    Useful for public endpoints that behave differently when authenticated.
    """
    if not credentials:
        return None
    try:
        return decode_access_token(credentials.credentials)
    except JWTError:
        return None