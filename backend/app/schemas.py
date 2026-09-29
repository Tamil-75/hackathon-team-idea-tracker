from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Request Schemas ──────────────────────────────────────────


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    register_number: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# ── Response Schemas ─────────────────────────────────────────


class UserResponse(BaseModel):
    id: int
    name: str
    register_number: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Team Schemas ─────────────────────────────────────────────


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    max_members: int = Field(default=5, ge=2, le=10)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    max_members: int | None = Field(default=None, ge=2, le=10)


class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    name: str
    register_number: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class TeamResponse(BaseModel):
    id: int
    name: str
    description: str
    leader_id: int
    leader_name: str
    member_count: int
    max_members: int
    available_slots: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeamDetailResponse(BaseModel):
    id: int
    name: str
    description: str
    leader_id: int
    leader_name: str
    member_count: int
    max_members: int
    available_slots: int
    created_at: datetime
    updated_at: datetime
    members: list[TeamMemberResponse]

    model_config = {"from_attributes": True}


# ── Idea Schemas ─────────────────────────────────────────────


class IdeaCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=1, max_length=2000)
    problem_statement: str = Field(..., min_length=1, max_length=2000)
    proposed_solution: str = Field(..., min_length=1, max_length=2000)
    category: str = Field(..., min_length=1, max_length=100)
    technology_stack: str = Field(..., min_length=1, max_length=255)
    github_url: str | None = Field(default=None, max_length=500)
    team_id: int | None = None


class IdeaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=150)
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    problem_statement: str | None = Field(default=None, min_length=1, max_length=2000)
    proposed_solution: str | None = Field(default=None, min_length=1, max_length=2000)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    technology_stack: str | None = Field(default=None, min_length=1, max_length=255)
    github_url: str | None = Field(default=None, max_length=500)
    team_id: int | None = None


class IdeaResponse(BaseModel):
    id: int
    title: str
    description: str
    problem_statement: str
    proposed_solution: str
    category: str
    technology_stack: str | None
    github_url: str | None
    status: str
    created_by: int
    creator_name: str
    team_id: int | None
    team_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IdeaDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    problem_statement: str
    proposed_solution: str
    category: str
    technology_stack: str | None
    github_url: str | None
    status: str
    created_by: int
    creator_name: str
    team_id: int | None
    team_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IdeaSubmitResponse(BaseModel):
    id: int
    title: str
    status: str
    message: str

    model_config = {"from_attributes": True}


# ── Admin Schemas ─────────────────────────────────────────────


class AdminUserResponse(BaseModel):
    id: int
    name: str
    register_number: str
    email: EmailStr
    role: str
    created_at: datetime
    team_id: int | None
    team_name: str | None

    model_config = {"from_attributes": True}


class AdminTeamMemberResponse(BaseModel):
    id: int
    user_id: int
    name: str
    register_number: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class AdminTeamResponse(BaseModel):
    id: int
    name: str
    description: str
    leader_id: int
    leader_name: str
    member_count: int
    max_members: int
    available_slots: int
    created_at: datetime
    updated_at: datetime
    members: list[AdminTeamMemberResponse]

    model_config = {"from_attributes": True}


class AdminIdeaResponse(BaseModel):
    id: int
    title: str
    description: str
    problem_statement: str
    proposed_solution: str
    category: str
    technology_stack: str | None
    github_url: str | None
    status: str
    created_by: int
    creator_name: str
    team_id: int | None
    team_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IdeaStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=50)


class IdeaStatusUpdateResponse(BaseModel):
    id: int
    title: str
    previous_status: str
    new_status: str
    message: str

    model_config = {"from_attributes": True}


class AdminStatisticsResponse(BaseModel):
    total_users: int
    total_students: int
    total_admins: int
    total_teams: int
    total_ideas: int
    draft_ideas: int
    submitted_ideas: int
    under_review_ideas: int
    approved_ideas: int
    rejected_ideas: int
    students_in_teams: int
    students_without_team: int
    teams_with_ideas: int
    teams_without_ideas: int

    model_config = {"from_attributes": True}


# ── Dashboard Schemas ─────────────────────────────────────────


class StudentDashboardUser(BaseModel):
    id: int
    name: str
    register_number: str
    email: EmailStr


class StudentDashboardTeam(BaseModel):
    id: int
    name: str
    description: str
    leader_id: int
    leader_name: str
    member_count: int
    max_members: int
    available_slots: int


class StudentDashboardIdeaStatistics(BaseModel):
    total: int
    draft: int
    submitted: int
    under_review: int
    approved: int
    rejected: int


class StudentDashboardIdea(BaseModel):
    id: int
    title: str
    category: str
    status: str
    team_id: int | None
    team_name: str | None
    created_at: datetime
    updated_at: datetime


class StudentDashboardResponse(BaseModel):
    user: StudentDashboardUser
    team: StudentDashboardTeam | None
    is_team_leader: bool
    idea_statistics: StudentDashboardIdeaStatistics
    recent_ideas: list[StudentDashboardIdea]


class AdminDashboardIdea(BaseModel):
    id: int
    title: str
    creator_name: str
    category: str
    status: str
    team_name: str | None
    created_at: datetime


class AdminDashboardTeam(BaseModel):
    id: int
    name: str
    leader_name: str
    member_count: int
    max_members: int
    created_at: datetime


class AdminDashboardUser(BaseModel):
    id: int
    name: str
    register_number: str
    role: str
    created_at: datetime


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_students: int
    total_admins: int
    total_teams: int
    total_ideas: int
    draft_ideas: int
    submitted_ideas: int
    under_review_ideas: int
    approved_ideas: int
    rejected_ideas: int
    students_in_teams: int
    students_without_team: int
    teams_with_ideas: int
    teams_without_ideas: int
    recent_ideas: list[AdminDashboardIdea]
    recent_teams: list[AdminDashboardTeam]
    recent_users: list[AdminDashboardUser]
