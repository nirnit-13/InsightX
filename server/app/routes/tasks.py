"""
server/app/routes/tasks.py
RBAC-enforced task endpoints.

FIX — Added GET /tasks/my (contributor-accessible):
  - Uses authenticated_required (not admin_required) so contributors can call it.
  - Returns ONLY tasks assigned to the current user.
  - Admins calling /tasks/my receive all their own assigned tasks.

FIX — GET /tasks/ is now role-aware:
  - Admin → all tasks (with optional filters).
  - Contributor → only their own assigned tasks.

This eliminates the root cause of the 403 loop on /tasks/my.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from bson import ObjectId
from datetime import datetime
from typing import Optional

from app.database.mongodb import get_db
from app.models.schemas import TaskCreate, TaskUpdate
from app.utils.permissions import (
    authenticated_required,
    admin_required,
    is_admin,
)

router = APIRouter()


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


# ── GET /tasks/my ─────────────────────────────────────────────────────────────
@router.get("/my")
async def get_my_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority:      Optional[str] = None,
    current_user:  dict          = Depends(authenticated_required),   # ← NOT admin_required
):
    """
    Return tasks assigned to the currently authenticated user.

    FIX: This endpoint MUST use authenticated_required (not admin_required).
         Both admins and contributors can call it.
         Filters: ?status=pending|in-progress|completed  ?priority=low|medium|high

    Root cause of 403: was previously using admin_required (or didn't exist),
    causing contributors to receive Forbidden on every dashboard load.
    """
    db      = get_db()
    user_id = current_user.get("sub") or current_user.get("id", "")

    query: dict = {"assigned_to": user_id}
    if status_filter:
        query["status"]   = status_filter
    if priority:
        query["priority"] = priority

    tasks = await db.tasks.find(query).sort("created_at", -1).to_list(length=500)
    return [serialize(t) for t in tasks]


# ── GET /tasks/ ───────────────────────────────────────────────────────────────
@router.get("/")
async def get_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority:      Optional[str] = None,
    assigned_to:   Optional[str] = None,
    current_user:  dict          = Depends(authenticated_required),
):
    """
    List tasks.

    FIX — Role-aware filtering:
      Admin       → all tasks matching optional filters.
      Contributor → only tasks assigned to themselves (assigned_to is forced).

    This prevents contributors from seeing other users' tasks even if they
    somehow reach this endpoint.
    """
    db    = get_db()
    query: dict = {}

    if is_admin(current_user):
        # Admin can filter by any user or see everything
        if status_filter:
            query["status"]      = status_filter
        if priority:
            query["priority"]    = priority
        if assigned_to:
            query["assigned_to"] = assigned_to
    else:
        # Contributor: always scoped to own tasks
        user_id = current_user.get("sub") or current_user.get("id", "")
        query["assigned_to"] = user_id
        if status_filter:
            query["status"]   = status_filter
        if priority:
            query["priority"] = priority

    tasks = await db.tasks.find(query).sort("created_at", -1).to_list(length=500)
    return [serialize(t) for t in tasks]


# ── GET /tasks/{task_id} ──────────────────────────────────────────────────────
@router.get("/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(authenticated_required)):
    db   = get_db()
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Contributor may only view their own tasks
    if not is_admin(current_user):
        user_id = current_user.get("sub") or current_user.get("id", "")
        if task.get("assigned_to") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return serialize(task)


# ── POST /tasks/ ──────────────────────────────────────────────────────────────
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, current_user: dict = Depends(authenticated_required)):
    db  = get_db()
    doc = {
        **payload.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "created_by": current_user.get("sub") or current_user.get("id"),
    }
    result  = await db.tasks.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


# ── PUT /tasks/{task_id} ──────────────────────────────────────────────────────
@router.put("/{task_id}")
async def update_task(
    task_id:      str,
    payload:      TaskUpdate,
    current_user: dict = Depends(authenticated_required),
):
    db          = get_db()
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()

    # Contributor can only update their own tasks
    if not is_admin(current_user):
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        user_id = current_user.get("sub") or current_user.get("id", "")
        if task.get("assigned_to") != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    # If marked completed, increment the assignee's completed_tasks counter
    if payload.status and payload.status.value == "completed":
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
        if task and task.get("assigned_to"):
            try:
                await db.users.update_one(
                    {"_id": ObjectId(task["assigned_to"])},
                    {"$inc": {"completed_tasks": 1}},
                )
            except Exception:
                pass   # don't fail the whole request over a counter update

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return serialize(updated)


# ── DELETE /tasks/{task_id} ───────────────────────────────────────────────────
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, admin: dict = Depends(admin_required)):
    """Only admins can delete tasks."""
    db     = get_db()
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")