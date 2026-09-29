import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Idea, IdeaStatus, Team, TeamMember, User
from app.schemas import (
    IdeaCreate,
    IdeaDetailResponse,
    IdeaResponse,
    IdeaSubmitResponse,
    IdeaUpdate,
)

router = APIRouter(prefix="/api/ideas", tags=["Ideas"])

# Statuses that students can edit (Draft and Rejected only)
STUDENT_EDITABLE_STATUSES = {IdeaStatus.DRAFT, IdeaStatus.REJECTED}


def get_idea_or_404(idea_id: int, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found",
        )
    return idea


def validate_github_url(url: str | None) -> None:
    if url is None:
        return
    pattern = r"^https?://(www\.)?github\.com/[\w\-]+/[\w\-]+/?$"
    if not re.match(pattern, url):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid GitHub URL format. Expected: https://github.com/user/repo",
        )


def validate_team_access(team_id: int | None, user_id: int, db: Session) -> None:
    if team_id is None:
        return
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    membership = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the team to associate an idea with it",
        )


def build_idea_response(idea: Idea) -> dict:
    return {
        "id": idea.id,
        "title": idea.title,
        "description": idea.description,
        "problem_statement": idea.problem_statement,
        "proposed_solution": idea.proposed_solution,
        "category": idea.category,
        "technology_stack": idea.technology_stack,
        "github_url": idea.github_url,
        "status": idea.status.value,
        "created_by": idea.created_by,
        "creator_name": idea.creator.name,
        "team_id": idea.team_id,
        "team_name": idea.team.name if idea.team else None,
        "created_at": idea.created_at,
        "updated_at": idea.updated_at,
    }


@router.get("", response_model=list[IdeaResponse])
def list_ideas(
    search: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None, max_length=100),
    status_filter: str | None = Query(default=None, alias="status", max_length=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    return [IdeaResponse(**build_idea_response(idea)) for idea in ideas]


@router.post("", response_model=IdeaDetailResponse, status_code=status.HTTP_201_CREATED)
def create_idea(
    data: IdeaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_github_url(data.github_url)
    validate_team_access(data.team_id, current_user.id, db)

    idea = Idea(
        title=data.title.strip(),
        description=data.description.strip(),
        problem_statement=data.problem_statement.strip(),
        proposed_solution=data.proposed_solution.strip(),
        category=data.category.strip(),
        technology_stack=data.technology_stack.strip(),
        github_url=data.github_url.strip() if data.github_url else None,
        status=IdeaStatus.DRAFT,
        created_by=current_user.id,
        team_id=data.team_id,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)

    return IdeaDetailResponse(**build_idea_response(idea))


@router.get("/{idea_id}", response_model=IdeaDetailResponse)
def get_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = get_idea_or_404(idea_id, db)
    return IdeaDetailResponse(**build_idea_response(idea))


@router.put("/{idea_id}", response_model=IdeaDetailResponse)
def update_idea(
    idea_id: int,
    data: IdeaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = get_idea_or_404(idea_id, db)

    # Only creator can edit
    if idea.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own ideas",
        )

    # Check if idea is in an editable status
    if idea.status not in STUDENT_EDITABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit an idea with status '{idea.status.value}'",
        )

    # Validate GitHub URL if provided
    if data.github_url is not None:
        validate_github_url(data.github_url)

    # Validate team access if team_id is being set
    if data.team_id is not None:
        validate_team_access(data.team_id, current_user.id, db)

    # Update fields
    if data.title is not None:
        idea.title = data.title.strip()
    if data.description is not None:
        idea.description = data.description.strip()
    if data.problem_statement is not None:
        idea.problem_statement = data.problem_statement.strip()
    if data.proposed_solution is not None:
        idea.proposed_solution = data.proposed_solution.strip()
    if data.category is not None:
        idea.category = data.category.strip()
    if data.technology_stack is not None:
        idea.technology_stack = data.technology_stack.strip()
    if data.github_url is not None:
        idea.github_url = data.github_url.strip() if data.github_url else None
    if data.team_id is not None:
        idea.team_id = data.team_id

    db.commit()
    db.refresh(idea)

    return IdeaDetailResponse(**build_idea_response(idea))


@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = get_idea_or_404(idea_id, db)

    # Only creator can delete
    if idea.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own ideas",
        )

    # Prevent deletion of Under Review or Approved ideas
    if idea.status in (IdeaStatus.UNDER_REVIEW, IdeaStatus.APPROVED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete an idea with status '{idea.status.value}'",
        )

    db.delete(idea)
    db.commit()


@router.post("/{idea_id}/submit", response_model=IdeaSubmitResponse)
def submit_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = get_idea_or_404(idea_id, db)

    # Only creator can submit
    if idea.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit your own ideas",
        )

    # Only Draft or Rejected ideas can be submitted
    if idea.status not in (IdeaStatus.DRAFT, IdeaStatus.REJECTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit an idea with status '{idea.status.value}'. Only Draft or Rejected ideas can be submitted.",
        )

    idea.status = IdeaStatus.SUBMITTED
    db.commit()
    db.refresh(idea)

    return IdeaSubmitResponse(
        id=idea.id,
        title=idea.title,
        status=idea.status.value,
        message="Idea submitted successfully for review",
    )
