"""
Development-only seed script.
Creates an admin account if one does not already exist.
Safe to run multiple times — will not create duplicates.

Usage:
    cd backend
    python seed.py
"""

import sys
import os

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.auth import hash_password
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User, UserRole


def seed_admin():
    # Ensure tables exist before seeding
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            print(f"Admin already exists: {existing.email} (id={existing.id})")
            return

        admin = User(
            name=settings.ADMIN_NAME,
            register_number=settings.ADMIN_REGISTER_NUMBER,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Admin created successfully: {admin.email} (id={admin.id})")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
