import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# ── Config ──────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("JWT_SECRET", "insightx-super-secret-key-change-in-production")
ALGORITHM   = "HS256"
EXPIRE_MINS = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))  # 24 hours

# ── Passlib context (bcrypt) ────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password utilities ───────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# ── JWT utilities ────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload dict (should include 'sub', 'email', 'role').
        expires_delta: Optional custom expiry; defaults to EXPIRE_MINS.

    Returns:
        Encoded JWT string.
    """
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MINS))
    payload.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.

    Args:
        token: Raw JWT string.

    Returns:
        Decoded payload dict.

    Raises:
        JWTError: If the token is invalid or expired.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def create_refresh_token(user_id: str) -> str:
    """Create a longer-lived refresh token (7 days)."""
    payload = {"sub": user_id, "type": "refresh"}
    expire = datetime.utcnow() + timedelta(days=7)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def is_token_valid(token: str) -> bool:
    """Return True if token decodes without error, False otherwise."""
    try:
        decode_access_token(token)
        return True
    except JWTError:
        return False