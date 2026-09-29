from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Idea, IdeaStatus, Team, TeamMember, User, UserRole
from app.schemas import (
    AdminIdeaResponse,
    AdminStatisticsResponse,
    AdminTeamResponse,
    AdminUserResponse,
    IdeaStatusUpdate,
    IdeaStatusUpdateResponse,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Allowed admin status transitions
ALLOWED_TRANSITIONS = {
    IdeaStatus.SUBMITTED: {IdeaStatus.UNDER_REVIEW},
    IdeaStatus.UNDER_REVIEW: {IdeaStatus.APPROVED, IdeaStatus.REJECTED},
    IdeaStatus.REJECTED: {IdeaStatus.UNDER_REVIEW},
}


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    search: str | None = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    query = db.query(User)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.register_number.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    users = query.order_by(User.created_at.desc()).all()

    result = []
    for user in users:
        team_membership = (
            db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
        )
        team = None
        if team_membership:
            team = db.query(Team).filter(Team.id == team_membership.team_id).first()

        result.append(
            AdminUserResponse(
                id=user.id,
                name=user.name,
                register_number=user.register_number,
                email=user.email,
                role=user.role.value,
                created_at=user.created_at,
                team_id=team.id if team else None,
                team_name=team.name if team else None,
            )
        )
    return result


@router.get("/teams", response_model=list[AdminTeamResponse])
def list_teams(
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    query = db.query(Team)

    if search:
        query = query.filter(Team.name.ilike(f"%{search}%"))

    teams = query.order_by(Team.created_at.desc()).all()

    result = []
    for team in teams:
        member_count = len(team.members)
        result.append(
            AdminTeamResponse(
                id=team.id,
                name=team.name,
                description=team.description,
                leader_id=team.leader_id,
                leader_name=team.leader.name,
                member_count=member_count,
                max_members=team.max_members,
                available_slots=team.max_members - member_count,
                created_at=team.created_at,
                updated_at=team.updated_at,
                members=[
                    {
                        "id": m.id,
                        "user_id": m.user_id,
                        "name": m.user.name,
                        "register_number": m.user.register_number,
                        "joined_at": m.joined_at,
                    }
                    for m in team.members
                ],
            )
        )
    return result


@router.get("/ideas", response_model=list[AdminIdeaResponse])
def list_ideas(
    search: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None, max_length=100),
    status_filter: str | None = Query(default=None, alias="status", max_length=50),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    query = db.query(Idea)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Idea.title.ilike(search_term),
                Idea.description.ilike(search_term),
                Idea.problem_statement.ilike(search_term),
            )
        )

    if category:
        query = query.filter(Idea.category.ilike(f"%{category}%"))

    if status_filter:
        try:
            status_enum = IdeaStatus(status_filter)
            query = query.filter(Idea.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}",
            )

    ideas = query.order_by(Idea.created_at.desc()).all()

    result = []
    for idea in ideas:
        result.append(
            AdminIdeaResponse(
                id=idea.id,
                title=idea.title,
                description=idea.description,
                problem_statement=idea.problem_statement,
                proposed_solution=idea.proposed_solution,
                category=idea.category,
                technology_stack=idea.technology_stack,
                github_url=idea.github_url,
                status=idea.status.value,
                created_by=idea.created_by,
                creator_name=idea.creator.name,
                team_id=idea.team_id,
                team_name=idea.team.name if idea.team else None,
                created_at=idea.created_at,
                updated_at=idea.updated_at,
            )
        )
    return result


@router.patch("/ideas/{idea_id}/status", response_model=IdeaStatusUpdateResponse)
def update_idea_status(
    idea_id: int,
    data: IdeaStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )

    # Validate the target status
    try:
        new_status = IdeaStatus(data.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status: {data.status}",
        )

    current_status = idea.status

    # Check if transition is allowed
    if current_status not in ALLOWED_TRANSITIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current_status.value}' to '{new_status.value}'",
        )

    if new_status not in ALLOWED_TRANSITIONS[current_status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition: '{current_status.value}' → '{new_status.value}'",
        )

    idea.status = new_status
    db.commit()
    db.refresh(idea)

    return IdeaStatusUpdateResponse(
        id=idea.id,
        title=idea.title,
        previous_status=current_status.value,
        new_status=new_status.value,
        message=f"Idea status updated from '{current_status.value}' to '{new_status.value}'",
    )


@router.get("/statistics", response_model=AdminStatisticsResponse)
def get_statistics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_students = (
        db.query(func.count(User.id)).filter(User.role == UserRole.STUDENT).scalar()
    )
    total_admins = (
        db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar()
    )
    total_teams = db.query(func.count(Team.id)).scalar()
    total_ideas = db.query(func.count(Idea.id)).scalar()

    draft_ideas = (
        db.query(func.count(Idea.id)).filter(Idea.status == IdeaStatus.DRAFT).scalar()
    )
    submitted_ideas = (
        db.query(func.count(Idea.id))
        .filter(Idea.status == IdeaStatus.SUBMITTED)
        .scalar()
    )
    under_review_ideas = (
        db.query(func.count(Idea.id))
        .filter(Idea.status == IdeaStatus.UNDER_REVIEW)
        .scalar()
    )
    approved_ideas = (
        db.query(func.count(Idea.id))
        .filter(Idea.status == IdeaStatus.APPROVED)
        .scalar()
    )
    rejected_ideas = (
        db.query(func.count(Idea.id))
        .filter(Idea.status == IdeaStatus.REJECTED)
        .scalar()
    )

    students_in_teams = (
        db.query(func.count(TeamMember.user_id))
        .join(User, TeamMember.user_id == User.id)
        .filter(User.role == UserRole.STUDENT)
        .scalar()
    )
    students_without_team = total_students - students_in_teams

    teams_with_ideas = (
        db.query(func.count(func.distinct(Idea.team_id)))
        .filter(Idea.team_id.isnot(None))
        .scalar()
    )
    teams_without_ideas = total_teams - teams_with_ideas

    return AdminStatisticsResponse(
        total_users=total_users,
        total_students=total_students,
        total_admins=total_admins,
        total_teams=total_teams,
        total_ideas=total_ideas,
        draft_ideas=draft_ideas,
        submitted_ideas=submitted_ideas,
        under_review_ideas=under_review_ideas,
        approved_ideas=approved_ideas,
        rejected_ideas=rejected_ideas,
        students_in_teams=students_in_teams,
        students_without_team=students_without_team,
        teams_with_ideas=teams_with_ideas,
        teams_without_ideas=teams_without_ideas,
    )
