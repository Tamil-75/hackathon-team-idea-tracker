from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Team, TeamMember, User, UserRole
from app.schemas import (
    TeamCreate,
    TeamDetailResponse,
    TeamResponse,
    TeamUpdate,
)

router = APIRouter(prefix="/api/teams", tags=["Teams"])


def get_team_or_404(team_id: int, db: Session) -> Team:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    return team


def get_user_team_membership(user_id: int, db: Session) -> TeamMember | None:
    return db.query(TeamMember).filter(TeamMember.user_id == user_id).first()


@router.get("", response_model=list[TeamResponse])
def list_teams(
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Team)
    if search:
        query = query.filter(Team.name.ilike(f"%{search}%"))
    teams = query.order_by(Team.created_at.desc()).all()

    result = []
    for team in teams:
        member_count = len(team.members)
        result.append(
            TeamResponse(
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
            )
        )
    return result


@router.post("", response_model=TeamDetailResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if user is already in a team
    existing_membership = get_user_team_membership(current_user.id, db)
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of a team. Leave your current team first.",
        )

    # Create team with current user as leader
    team = Team(
        name=data.name,
        description=data.description,
        leader_id=current_user.id,
        max_members=data.max_members,
    )
    db.add(team)
    db.flush()  # Get team.id without committing

    # Add leader as first member
    membership = TeamMember(team_id=team.id, user_id=current_user.id)
    db.add(membership)
    db.commit()
    db.refresh(team)

    return TeamDetailResponse(
        id=team.id,
        name=team.name,
        description=team.description,
        leader_id=team.leader_id,
        leader_name=team.leader.name,
        member_count=1,
        max_members=team.max_members,
        available_slots=team.max_members - 1,
        created_at=team.created_at,
        updated_at=team.updated_at,
        members=[
            {
                "id": membership.id,
                "user_id": current_user.id,
                "name": current_user.name,
                "register_number": current_user.register_number,
                "joined_at": membership.joined_at,
            }
        ],
    )


@router.get("/{team_id}", response_model=TeamDetailResponse)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = get_team_or_404(team_id, db)
    member_count = len(team.members)

    return TeamDetailResponse(
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


@router.put("/{team_id}", response_model=TeamDetailResponse)
def update_team(
    team_id: int,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = get_team_or_404(team_id, db)

    # Only leader can edit
    if team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team leader can edit team details",
        )

    # Validate max_members isn't less than current member count
    if data.max_members is not None:
        current_member_count = len(team.members)
        if data.max_members < current_member_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"max_members cannot be less than current member count ({current_member_count})",
            )

    if data.name is not None:
        team.name = data.name
    if data.description is not None:
        team.description = data.description
    if data.max_members is not None:
        team.max_members = data.max_members

    db.commit()
    db.refresh(team)

    member_count = len(team.members)
    return TeamDetailResponse(
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


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = get_team_or_404(team_id, db)

    # Only leader can delete
    if team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team leader can delete the team",
        )

    # Only allow deletion if leader is the only member
    if len(team.members) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a team with multiple members. Members must leave first.",
        )

    db.delete(team)
    db.commit()


@router.post("/{team_id}/join", response_model=TeamDetailResponse)
def join_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = get_team_or_404(team_id, db)

    # Check if user is already in a team
    existing_membership = get_user_team_membership(current_user.id, db)
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of a team. Leave your current team first.",
        )

    # Check if team is full
    current_member_count = len(team.members)
    if current_member_count >= team.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full",
        )

    # Add membership
    membership = TeamMember(team_id=team.id, user_id=current_user.id)
    db.add(membership)
    db.commit()
    db.refresh(team)

    member_count = len(team.members)
    return TeamDetailResponse(
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


@router.post("/{team_id}/leave", status_code=status.HTTP_200_OK)
def leave_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = get_team_or_404(team_id, db)

    # Check if user is a member
    membership = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this team",
        )

    # Leader cannot leave while still leader
    if team.leader_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team leader cannot leave the team. Transfer leadership or delete the team.",
        )

    db.delete(membership)
    db.commit()

    return {"message": "Successfully left the team"}
