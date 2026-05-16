"""
server/app/utils/permissions.py

Re-exports auth dependencies from app/middleware/auth.py and adds
is_admin / is_contributor helpers used inline in route handlers.
"""

from app.middleware.auth import (
    get_current_user,
    admin_required,
    require_contributor_or_admin,
)

# Both roles — used as Depends(authenticated_required) in route signatures
authenticated_required = require_contributor_or_admin


# is_admin / is_contributor — used as plain function calls in route bodies
def is_admin(current_user: dict) -> bool:
    return current_user.get("role") == "admin"


def is_contributor(current_user: dict) -> bool:
    return current_user.get("role") == "contributor"