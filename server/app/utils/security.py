"""
server/app/utils/security.py
JWT creation, decoding, and password hashing utilities.

FIX: JWT payload now always includes { sub, email, role, id } so that
     middleware and frontend can reliably extract the role without hitting
     the database on every request.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

# ── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("JWT_SECRET", "insightx-super-secret-key-change-in-production")
ALGORITHM   = "HS256"
EXPIRE_MINS = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))  # 24 hours

# ── Passlib context (bcrypt) ─────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password utilities ────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# ── JWT utilities ─────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    FIX: Ensures the payload always contains:
      - sub   : user_id (string)
      - email : user email
      - role  : 'admin' | 'contributor'
      - id    : duplicate of sub for frontend convenience

    Args:
        data: Must include 'sub' (user_id), 'email', and 'role'.
        expires_delta: Optional custom expiry; defaults to EXPIRE_MINS.

    Returns:
        Encoded JWT string.
    """
    payload = data.copy()

    # Guarantee role is always present (default to contributor for safety)
    if "role" not in payload:
        payload["role"] = "contributor"

    # Guarantee 'id' mirrors 'sub' so frontend can use either
    if "sub" in payload and "id" not in payload:
        payload["id"] = payload["sub"]

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MINS))
    payload.update({
        "exp": expire,
        "iat": datetime.utcnow(),
    })
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.

    Returns:
        Decoded payload dict containing at minimum: sub, email, role, id, exp, iat.

    Raises:
        JWTError: If the token is invalid, expired, or malformed.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    # Back-fill 'id' from 'sub' if an older token is missing it
    if "id" not in payload and "sub" in payload:
        payload["id"] = payload["sub"]

    return payload


def create_refresh_token(user_id: str) -> str:
    """Create a longer-lived refresh token (7 days)."""
    payload = {
        "sub":  user_id,
        "id":   user_id,
        "type": "refresh",
        "exp":  datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def is_token_valid(token: str) -> bool:
    """Return True if token decodes without error, False otherwise."""
    try:
        decode_access_token(token)
        return True
    except JWTError:
        return False