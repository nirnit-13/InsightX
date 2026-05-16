from fastapi import APIRouter, HTTPException, Depends, status
from app.database.mongodb import get_db
from app.models.schemas import ContributorCreate, ContributorUpdate, ContributorOut
from app.middleware.auth import get_current_user
from app.utils.permissions import admin_required
from bson import ObjectId
from typing import List

router = APIRouter()


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/", response_model=List[dict])
async def get_contributors(current_user=Depends(get_current_user)):
    db = get_db()
    contributors = await db.users.find({}, {"password": 0}).to_list(length=200)
    return [serialize(c) for c in contributors]


@router.get("/{contributor_id}")
async def get_contributor(contributor_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    doc = await db.users.find_one({"_id": ObjectId(contributor_id)}, {"password": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Contributor not found")
    return serialize(doc)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_contributor(payload: ContributorCreate, admin=Depends(admin_required)):
    db = get_db()
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    initials = "".join(w[0].upper() for w in payload.name.split()[:2])
    colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]
    doc = {
        **payload.dict(),
        "avatar": initials,
        "color": colors[hash(payload.email) % len(colors)],
        "completed_tasks": 0,
        "streak": 0,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.put("/{contributor_id}")
async def update_contributor(contributor_id: str, payload: ContributorUpdate, admin=Depends(admin_required)):
    db = get_db()
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.users.update_one(
        {"_id": ObjectId(contributor_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contributor not found")

    updated = await db.users.find_one({"_id": ObjectId(contributor_id)}, {"password": 0})
    return serialize(updated)


@router.delete("/{contributor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contributor(contributor_id: str, admin=Depends(admin_required)):
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(contributor_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contributor not found")