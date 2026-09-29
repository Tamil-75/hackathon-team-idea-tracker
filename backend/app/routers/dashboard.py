from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin, get_current_user
from app.models import Idea, IdeaStatus, Team, TeamMember, User, UserRole
from app.schemas import (
    AdminDashboardResponse,
    StudentDashboardIdea,
    StudentDashboardIdeaStatistics,
    StudentDashboardResponse,
    StudentDashboardTeam,
    StudentDashboardUser,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/student", response_model=StudentDashboardResponse)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get user's team membership
    membership = (
        db.query(TeamMember).filter(TeamMember.user_id == current_user.id).first()
    )

    team = None
    is_team_leader = False

    if membership:
        team_obj = db.query(Team).filter(Team.id == membership.team_id).first()
        if team_obj:
            member_count = len(team_obj.members)
            team = StudentDashboardTeam(
                id=team_obj.id,
                name=team_obj.name,
                description=team_obj.description,
                leader_id=team_obj.leader_id,
                leader_name=team_obj.leader.name,
                member_count=member_count,
                max_members=team_obj.max_members,
                available_slots=team_obj.max_members - member_count,
            )
            is_team_leader = team_obj.leader_id == current_user.id

    # Get user's ideas
    user_ideas = (
        db.query(Idea).filter(Idea.created_by == current_user.id).all()
    )

    # Count by status
    draft_count = sum(1 for i in user_ideas if i.status == IdeaStatus.DRAFT)
    submitted_count = sum(1 for i in user_ideas if i.status == IdeaStatus.SUBMITTED)
    under_review_count = sum(1 for i in user_ideas if i.status == IdeaStatus.UNDER_REVIEW)
    approved_count = sum(1 for i in user_ideas if i.status == IdeaStatus.APPROVED)
    rejected_count = sum(1 for i in user_ideas if i.status == IdeaStatus.REJECTED)

    # Get recent ideas (newest first, limit 5)
    recent_ideas = (
        db.query(Idea)
        .filter(Idea.created_by == current_user.id)
        .order_by(Idea.created_at.desc())
        .limit(5)
        .all()
    )

    recent_ideas_data = [
        StudentDashboardIdea(
            id=idea.id,
            title=idea.title,
            category=idea.category,
            status=idea.status.value,
            team_id=idea.team_id,
            team_name=idea.team.name if idea.team else None,
            created_at=idea.created_at,
            updated_at=idea.updated_at,
        )
        for idea in recent_ideas
    ]

    return StudentDashboardResponse(
        user=StudentDashboardUser(
            id=current_user.id,
            name=current_user.name,
            register_number=current_user.register_number,
            email=current_user.email,
        ),
        team=team,
        is_team_leader=is_team_leader,
        idea_statistics=StudentDashboardIdeaStatistics(
            total=len(user_ideas),
            draft=draft_count,
            submitted=submitted_count,
            under_review=under_review_count,
            approved=approved_count,
            rejected=rejected_count,
        ),
        recent_ideas=recent_ideas_data,
    )


@router.get("/admin", response_model=AdminDashboardResponse)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    # User statistics
    total_users = db.query(func.count(User.id)).scalar()
    total_students = (
        db.query(func.count(User.id)).filter(User.role == UserRole.STUDENT).scalar()
    )
    total_admins = (
        db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar()
    )

    # Team statistics
    total_teams = db.query(func.count(Team.id)).scalar()

    # Idea statistics
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

    # Team membership statistics
    students_in_teams = (
        db.query(func.count(TeamMember.user_id))
        .join(User, TeamMember.user_id == User.id)
        .filter(User.role == UserRole.STUDENT)
        .scalar()
    )
    students_without_team = total_students - students_in_teams

    # Teams with/without ideas
    teams_with_ideas = (
        db.query(func.count(func.distinct(Idea.team_id)))
        .filter(Idea.team_id.isnot(None))
        .scalar()
    )
    teams_without_ideas = total_teams - teams_with_ideas

    # Recent ideas (newest 5)
    recent_ideas = (
        db.query(Idea).order_by(Idea.created_at.desc()).limit(5).all()
    )
    recent_ideas_data = [
        {
            "id": idea.id,
            "title": idea.title,
            "creator_name": idea.creator.name,
            "category": idea.category,
            "status": idea.status.value,
            "team_name": idea.team.name if idea.team else None,
            "created_at": idea.created_at,
        }
        for idea in recent_ideas
    ]

    # Recent teams (newest 5)
    recent_teams = (
        db.query(Team).order_by(Team.created_at.desc()).limit(5).all()
    )
    recent_teams_data = [
        {
            "id": team.id,
            "name": team.name,
            "leader_name": team.leader.name,
            "member_count": len(team.members),
            "max_members": team.max_members,
            "created_at": team.created_at,
        }
        for team in recent_teams
    ]

    # Recent users (newest 5)
    recent_users = (
        db.query(User).order_by(User.created_at.desc()).limit(5).all()
    )
    recent_users_data = [
        {
            "id": user.id,
            "name": user.name,
            "register_number": user.register_number,
            "role": user.role.value,
            "created_at": user.created_at,
        }
        for user in recent_users
    ]

    return AdminDashboardResponse(
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
        recent_ideas=recent_ideas_data,
        recent_teams=recent_teams_data,
        recent_users=recent_users_data,
    )
