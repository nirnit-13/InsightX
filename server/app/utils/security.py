"""
server/app/utils/security.py
JWT encoding/decoding + password hashing.
Imported by app/middleware/auth.py and app/routes/auth.py
"""

import os
from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

# ── Config ────────────────────────────────────────────────────────────────────
# Reads JWT_SECRET from .env — must match exactly between sign and verify.
# Your .env has: JWT_SECRET=your_secret_key
SECRET_KEY = os.getenv("JWT_SECRET", "your_secret_key")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire  = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    # Raises jose.JWTError on invalid/expired — caught by middleware/auth.py
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])