"""
server/app/database/mongodb.py
Retry-safe async MongoDB connection with environment validation.
"""

import os
import logging
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME   = os.getenv("DB_NAME", "insightx")
MAX_RETRIES    = 3
RETRY_DELAY    = 2.0   # seconds between connection attempts

# ── Module-level state ────────────────────────────────────────────────────────
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


# ── Startup / shutdown ────────────────────────────────────────────────────────
async def connect_db() -> None:
    """
    Connect to MongoDB with validation and retry logic.
    Called once on FastAPI startup.
    """
    global _client, _db

    if not MONGO_URI:
        logger.critical(
            "MONGO_URI is not set. Add it to your .env file.\n"
            "Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/"
        )
        raise EnvironmentError("MONGO_URI environment variable is required but not set.")

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("Connecting to MongoDB (attempt %d/%d)…", attempt, MAX_RETRIES)
            _client = AsyncIOMotorClient(
                MONGO_URI,
                serverSelectionTimeoutMS=8_000,
                connectTimeoutMS=8_000,
                socketTimeoutMS=10_000,
            )
            # Ping to validate the connection immediately
            await _client.admin.command("ping")
            _db = _client[DB_NAME]

            # Ensure required indexes exist (idempotent)
            await _ensure_indexes()

            logger.info("✅ Connected to MongoDB: %s", DB_NAME)
            return

        except Exception as exc:
            logger.warning("MongoDB connection attempt %d failed: %s", attempt, exc)
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_DELAY * attempt)
            else:
                logger.critical("All %d MongoDB connection attempts failed.", MAX_RETRIES)
                raise


async def close_db() -> None:
    """Close the MongoDB connection. Called on FastAPI shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("🔌 MongoDB connection closed.")


# ── Index setup ────────────────────────────────────────────────────────────────
async def _ensure_indexes() -> None:
    """Create required indexes (runs on every startup — idempotent)."""
    if _db is None:
        return
    try:
        # users
        await _db.users.create_index("email", unique=True, background=True)
        await _db.users.create_index("role",  background=True)
        await _db.users.create_index("productivity_score", background=True)

        # tasks
        await _db.tasks.create_index("assigned_to", background=True)
        await _db.tasks.create_index("status",      background=True)
        await _db.tasks.create_index("priority",    background=True)
        await _db.tasks.create_index("created_at",  background=True)
        await _db.tasks.create_index("deadline",    background=True)

        logger.info("✅ MongoDB indexes verified.")
    except Exception as exc:
        logger.warning("Index creation warning (non-fatal): %s", exc)


# ── Public accessor ────────────────────────────────────────────────────────────
def get_db() -> AsyncIOMotorDatabase:
    """
    Return the active database instance.

    Raises:
        RuntimeError: If called before connect_db() has completed.
    """
    if _db is None:
        raise RuntimeError(
            "Database is not connected. Ensure connect_db() was called during startup."
        )
    return _db


def get_client() -> AsyncIOMotorClient:
    """Return the raw Motor client (for advanced usage)."""
    if _client is None:
        raise RuntimeError("MongoDB client is not initialized.")
    return _client


# ── Collection shorthands ──────────────────────────────────────────────────────
def users_collection():
    return get_db().users


def tasks_collection():
    return get_db().tasks


def reports_collection():
    return get_db().reports