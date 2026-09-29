from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import admin, auth, dashboard, ideas, teams

# Create tables on startup (development mode)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hackathon Team Formation & Idea Tracker",
    description="Backend API for managing hackathon teams and project ideas",
    version="1.0.0",
)

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(ideas.router)
app.include_router(admin.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Hackathon Team Formation & Idea Tracker API"}


@app.get("/health")
def health():
    return {"status": "ok"}
