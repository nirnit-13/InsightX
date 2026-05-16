"""
server/app/utils/permissions.py
Standardized RBAC dependency helpers.

FIX: Three canonical FastAPI dependencies:
  - authenticated_required  → any logged-in user (admin OR contributor)
  - admin_required          → admin only
  - contributor_required    → contributor only

Use these consistently across ALL routes instead of mixing auth helpers.
"""

from fastapi import HTTPException, status, Depends

from app.middleware.auth import get_current_user


# ── Role constants ────────────────────────────────────────────────────────────
ROLE_ADMIN       = "admin"
ROLE_CONTRIBUTOR = "contributor"


# ── Low-level predicates ──────────────────────────────────────────────────────
def is_admin(user: dict) -> bool:
    return user.get("role") == ROLE_ADMIN


def is_contributor(user: dict) -> bool:
    return user.get("role") == ROLE_CONTRIBUTOR


def has_any_role(user: dict, roles: list[str]) -> bool:
    return user.get("role") in roles


# ── FastAPI dependency: any authenticated user ────────────────────────────────
async def authenticated_required(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency — requires any authenticated user (admin OR contributor).

    Usage:
        @router.get("/analytics/leaderboard")
        async def leaderboard(user=Depends(authenticated_required)):
            ...
    """
    if not has_any_role(current_user, [ROLE_ADMIN, ROLE_CONTRIBUTOR]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authentication required",
        )
    return current_user


# ── FastAPI dependency: admin only ────────────────────────────────────────────
async def admin_required(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency — restricts endpoint to admin role only.

    Usage:
        @router.delete("/{id}")
        async def delete_resource(admin=Depends(admin_required)):
            ...
    """
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires admin privileges",
        )
    return current_user


# ── FastAPI dependency: contributor only ──────────────────────────────────────
async def contributor_required(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency — restricts endpoint to contributor role only.

    Usage:
        @router.get("/my-profile")
        async def my_profile(user=Depends(contributor_required)):
            ...
    """
    if not is_contributor(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is for contributors only",
        )
    return current_user


# ── Resource ownership check ──────────────────────────────────────────────────
def assert_owner_or_admin(current_user: dict, resource_owner_id: str) -> None:
    """
    Raise 403 if the current user is NOT the resource owner and NOT an admin.

    Args:
        current_user:       Decoded JWT payload dict (contains 'sub' / 'id').
        resource_owner_id:  The user-id stored on the resource being accessed.
    """
    if is_admin(current_user):
        return  # admins bypass ownership checks
    user_id = current_user.get("sub") or current_user.get("id", "")
    if user_id != resource_owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own resources",
        )


# ── Task-specific helpers ─────────────────────────────────────────────────────
def can_delete_task(user: dict) -> bool:
    """Only admins may delete tasks."""
    return is_admin(user)


def can_edit_task(user: dict, task: dict) -> bool:
    """Admins can edit any task; contributors only their assigned tasks."""
    if is_admin(user):
        return True
    user_id = user.get("sub") or user.get("id", "")
    return task.get("assigned_to") == user_id


def can_view_task(user: dict, task: dict) -> bool:
    """Admins see all tasks; contributors only their own."""
    if is_admin(user):
        return True
    user_id = user.get("sub") or user.get("id", "")
    return task.get("assigned_to") == user_id


# ── Contributor management ────────────────────────────────────────────────────
def can_manage_contributors(user: dict) -> bool:
    """Only admins can create / update / delete contributors."""
    return is_admin(user)


# ── Analytics checks ──────────────────────────────────────────────────────────
def can_view_org_analytics(user: dict) -> bool:
    """Organization-wide analytics is admin-only."""
    return is_admin(user)


def can_view_own_analytics(user: dict) -> bool:
    """Any authenticated user can view their own stats."""
    return True


# ── Report checks ─────────────────────────────────────────────────────────────
def can_generate_reports(user: dict) -> bool:
    return is_admin(user)


def can_export_reports(user: dict) -> bool:
    return is_admin(user)