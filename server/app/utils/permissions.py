from fastapi import HTTPException, status, Depends
from app.middleware.auth import get_current_user


# ── Role constants ────────────────────────────────────────────────────────────
ROLE_ADMIN       = "admin"
ROLE_CONTRIBUTOR = "contributor"


# ── Low-level checks ─────────────────────────────────────────────────────────
def is_admin(user: dict) -> bool:
    return user.get("role") == ROLE_ADMIN


def is_contributor(user: dict) -> bool:
    return user.get("role") == ROLE_CONTRIBUTOR


def has_any_role(user: dict, roles: list[str]) -> bool:
    return user.get("role") in roles


# ── FastAPI dependency: admin only ────────────────────────────────────────────
async def admin_only(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency — restricts endpoint to admin role only.

    Usage:
        @router.delete("/{id}")
        async def delete_something(admin=Depends(admin_only)):
            ...
    """
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires admin privileges",
        )
    return current_user


# ── FastAPI dependency: contributor or admin ──────────────────────────────────
async def contributor_or_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency — allows both contributors and admins.
    """
    if not has_any_role(current_user, [ROLE_ADMIN, ROLE_CONTRIBUTOR]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    return current_user


# ── Resource ownership check ──────────────────────────────────────────────────
def assert_owner_or_admin(current_user: dict, resource_owner_id: str) -> None:
    """
    Raise 403 if the current user is NOT the resource owner and NOT an admin.

    Args:
        current_user: Decoded JWT payload dict.
        resource_owner_id: The user-id stored on the resource.
    """
    if is_admin(current_user):
        return  # admins can do anything
    if current_user.get("sub") != resource_owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own resources",
        )


# ── Task-specific checks ──────────────────────────────────────────────────────
def can_delete_task(user: dict) -> bool:
    """Only admins may delete tasks."""
    return is_admin(user)


def can_edit_task(user: dict, task: dict) -> bool:
    """Admins can edit any task; contributors only their own assigned tasks."""
    if is_admin(user):
        return True
    return task.get("assigned_to") == user.get("sub")


def can_view_task(user: dict, task: dict) -> bool:
    """Admins see all tasks; contributors only their own."""
    if is_admin(user):
        return True
    return task.get("assigned_to") == user.get("sub")


# ── Contributor-specific checks ───────────────────────────────────────────────
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