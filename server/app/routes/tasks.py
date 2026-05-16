from fastapi import APIRouter, HTTPException, Depends, status
from app.database.mongodb import get_db
from app.models.schemas import TaskCreate, TaskUpdate
from app.utils.auth import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

router = APIRouter()


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/")
async def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {}
    if status:      query["status"] = status
    if priority:    query["priority"] = priority
    if assigned_to: query["assigned_to"] = assigned_to

    tasks = await db.tasks.find(query).sort("created_at", -1).to_list(length=500)
    return [serialize(t) for t in tasks]


@router.get("/{task_id}")
async def get_task(task_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize(task)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, current_user=Depends(get_current_user)):
    db = get_db()
    doc = {
        **payload.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "created_by": current_user.get("sub"),
    }
    result = await db.tasks.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    # If completed, increment user's completed_tasks counter
    if payload.status and payload.status.value == "completed":
        task = await db.tasks.find_one({"_id": ObjectId(task_id)})
        if task and task.get("assigned_to"):
            await db.users.update_one(
                {"_id": ObjectId(task["assigned_to"])},
                {"$inc": {"completed_tasks": 1}}
            )

    updated = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return serialize(updated)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, admin=Depends(require_admin)):
    db = get_db()
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")