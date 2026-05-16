"""
server/app/utils/auth.py
Backward-compatible re-export layer.
All real logic lives in:
  - app.utils.security   → hashing, JWT creation/decoding
  - app.middleware.auth  → FastAPI dependencies (get_current_user, require_admin)

Existing routes import from here so nothing breaks.
"""

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token as decode_token,
)

from app.middleware.auth import (
    get_current_user,
    require_admin,
    require_contributor_or_admin,
    get_current_user_optional,
)

__all__ = [
    # security helpers
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_token",
    # FastAPI deps
    "get_current_user",
    "require_admin",
    "require_contributor_or_admin",
    "get_current_user_optional",
]