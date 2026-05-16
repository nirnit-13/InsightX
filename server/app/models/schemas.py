from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    admin = "admin"
    contributor = "contributor"


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in-progress"
    completed = "completed"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ── Auth ───────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.contributor


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── User / Contributor ─────────────────────────────────────────────────────
class ContributorCreate(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.contributor
    team: Optional[str] = "General"
    skills: Optional[List[str]] = []
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    attendance: Optional[float] = 100.0
    productivity_score: Optional[float] = 75.0


class ContributorUpdate(BaseModel):
    name: Optional[str] = None
    team: Optional[str] = None
    skills: Optional[List[str]] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    attendance: Optional[float] = None
    productivity_score: Optional[float] = None


class ContributorOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    team: str
    skills: List[str]
    github: str
    linkedin: str
    attendance: float
    productivity_score: float
    completed_tasks: int = 0
    streak: int = 0
    avatar: str
    color: str


# ── Tasks ──────────────────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    assigned_to: Optional[str] = None
    deadline: Optional[str] = None
    tags: Optional[List[str]] = []
    team: Optional[str] = "General"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[str] = None
    deadline: Optional[str] = None
    tags: Optional[List[str]] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    assigned_to: Optional[str]
    deadline: Optional[str]
    tags: List[str]
    team: str
    created_at: str


# ── Analytics ──────────────────────────────────────────────────────────────
class AnalyticsOverview(BaseModel):
    total_contributors: int
    active_users: int
    task_completion_rate: float
    weekly_productivity: float
    engagement_score: float
    attendance_avg: float
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int


# ── AI ─────────────────────────────────────────────────────────────────────
class AIInsightRequest(BaseModel):
    context: Optional[dict] = {}
    prompt: Optional[str] = ""


class AIReportRequest(BaseModel):
    report_type: str = "weekly"
    analytics_data: Optional[dict] = {}