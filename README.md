# Hackathon Team Formation and Idea Tracker

## Overview

A web-based platform for managing hackathon team formation, project idea submission, and administrative review. Students can register, form teams, submit ideas, and track their progress. Administrators can review ideas, manage the approval workflow, and monitor system statistics.

## Problem Statement

Students often need a centralized system to form teams, discover teams, manage membership, propose hackathon ideas, and track idea status. Without such a system, coordination becomes difficult and ideas may be lost or duplicated.

Administrators need centralized visibility into students, teams, and ideas, along with tools to manage the review workflow and track statistics.

## Solution

This project provides a complete platform with role-based authentication, student and admin dashboards, team management, idea tracking, and an administrative review workflow. The application features a responsive UI that works across desktop, tablet, and mobile devices.

## Key Features

### Student Features

- User registration and login
- Personal dashboard with statistics
- Create and manage teams
- Search and browse available teams
- Join and leave teams
- View team details and members
- Create project ideas
- Edit draft and rejected ideas
- Submit ideas for review
- Associate ideas with teams
- Track idea status through the review workflow

### Admin Features

- Admin authentication
- Dashboard with system statistics
- View all registered users
- Search students
- View all teams
- Search teams
- View all ideas
- Search and filter ideas
- Start review for submitted ideas
- Approve ideas
- Reject ideas
- Reopen rejected ideas for review

## Idea Workflow

```
Draft → Submitted → Under Review → Approved
                      ↓
                   Rejected → Under Review
```

Students can create ideas as drafts and submit them for review. Administrators then move ideas through the review workflow. Students cannot directly approve or reject ideas.

## Technology Stack

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- SQLite
- JWT (python-jose)
- bcrypt (passlib)
- Pydantic v2

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Axios
- Lucide React

## Architecture

```
User
  │
  ▼
React + TypeScript Frontend
  │
  │ REST API
  ▼
FastAPI Backend
  │
  ▼
SQLAlchemy
  │
  ▼
SQLite Database
```

### Authentication Flow

```
React Frontend
  │
  ▼
JWT Authentication
  │
  ▼
FastAPI Authorization
  │
  ├── Student Role
  │
  └── Admin Role
```

## Project Structure

```
hackathon-team-idea-tracker/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── ideas.py
│   │   │   └── teams.py
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── seed.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── public/
│   │   │   └── student/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all teams |
| POST | `/api/teams` | Create new team |
| GET | `/api/teams/{id}` | Get team details |
| PUT | `/api/teams/{id}` | Update team (leader only) |
| DELETE | `/api/teams/{id}` | Delete team (leader only) |
| POST | `/api/teams/{id}/join` | Join a team |
| POST | `/api/teams/{id}/leave` | Leave a team |

### Ideas

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas` | List ideas |
| POST | `/api/ideas` | Create new idea |
| GET | `/api/ideas/{id}` | Get idea details |
| PUT | `/api/ideas/{id}` | Update idea |
| DELETE | `/api/ideas/{id}` | Delete idea |
| POST | `/api/ideas/{id}/submit` | Submit idea for review |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/teams` | List all teams |
| GET | `/api/admin/ideas` | List all ideas |
| PATCH | `/api/admin/ideas/{id}/status` | Update idea status |
| GET | `/api/admin/statistics` | System statistics |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/student` | Student dashboard data |
| GET | `/api/dashboard/admin` | Admin dashboard data |

Interactive API documentation is available at `/docs` when the backend is running.

## Database Model

### Entities

**User**
- id, name, register_number, email, password_hash, role, created_at

**Team**
- id, name, description, leader_id, max_members, created_at, updated_at

**TeamMember**
- id, team_id, user_id, joined_at

**Idea**
- id, title, description, problem_statement, proposed_solution, category, technology_stack, github_url, status, created_by, team_id, created_at, updated_at

### Relationships

- A User can create many Ideas
- A User can belong to one Team (through TeamMember)
- A User can lead many Teams
- A Team has many TeamMembers
- A Team can have zero or more associated Ideas
- An Idea can optionally belong to one Team

## Security

- JWT-based authentication with HS256
- bcrypt password hashing
- Role-based authorization (student/admin)
- Protected admin endpoints
- Frontend route protection
- Backend authorization on all protected routes
- Environment variables for secrets
- Secrets excluded from version control
- Malformed JWT payload protection

## Validation and Business Rules

- One team per student
- Team membership limits (2-10 members)
- Leader must be a team member
- Only team leaders can edit/delete teams
- Team leaders cannot leave their teams
- Teams with multiple members cannot be deleted
- Creator-only idea editing
- Idea status transition rules
- Admin-only status management
- Team association validation

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run database seed (creates admin account)
python seed.py

# Start the server
uvicorn app.main:app --reload
```

Backend will be available at: http://127.0.0.1:8000

Swagger documentation: http://127.0.0.1:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Environment Variables

### Backend (.env)

```
DATABASE_URL=sqlite:///./hackathon.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

**Warning:** Never commit `.env` files to version control.

## Default Admin Account

The application includes a seed script (`backend/seed.py`) that creates a local development admin account if one does not already exist. The admin credentials are configured through environment variables in the `.env` file.

**Important:** The default development credentials are for local development and testing only. They must not be used in production. Always configure strong, unique credentials for any production deployment.

## Testing

### Backend

- 55/55 automated tests passed

### Frontend

- TypeScript compilation passed
- Vite production build passed
- HTTP smoke tests passed
- Swagger smoke test passed
- Security audit passed

## Responsive Design

The frontend supports:

- Desktop
- Laptop
- Tablet
- Mobile

Responsive features include:

- Collapsible sidebar navigation
- Responsive card grids
- Horizontal scrolling tables on mobile
- Adaptive form layouts
- Mobile-friendly filters and search

## Screenshots

Screenshots can be added here after capturing the final application.

## Future Enhancements

Possible future improvements:

- PostgreSQL database support for production
- Cloud deployment configuration
- Email notifications for status changes
- Advanced analytics and reporting
- Additional admin management controls
- File upload for project attachments
- Real-time updates with WebSockets

## Contributing

1. Create a new branch for your changes
2. Make your changes and test them thoroughly
3. Ensure all tests pass
4. Open a pull request with a clear description of changes

## Team

| Register Number | Name |
|---|---|
| 25AM115 | Tamil S |
| 25AM112 | Suguna S |
| 25AM113 | Sujith G |
| 25AM114 | Sunitha S |

## License

A license can be added by the project owners.
