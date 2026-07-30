from typing import AsyncGenerator
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, settings
from app.core.database import get_db
from app.core.security import TokenPayload, decode_supabase_token
from app.models.user import User
from app.services.user_service import user_service

bearer_scheme = HTTPBearer(auto_error=True)


def get_settings() -> Settings:
    """Dependency returning app configuration settings."""
    return settings


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> UUID:
    """
    Dependency to extract and validate Supabase JWT access token,
    returning the authenticated user's UUID and ensuring a user row exists in public.users.
    Prevents Foreign Key Constraint violations when inserting into relational child tables.
    """
    token = credentials.credentials
    token_payload: TokenPayload = decode_supabase_token(token)
    try:
        user_id = UUID(token_payload.sub)
        user = await user_service.get_user_by_id(db, user_id)
        if not user:
            user_email = token_payload.email or f"{user_id}@auth.supabase.local"
            user_name = ""
            if token_payload.user_metadata and isinstance(token_payload.user_metadata, dict):
                user_name = token_payload.user_metadata.get("full_name") or token_payload.user_metadata.get("name") or ""
            try:
                await user_service.get_or_create_user(db, user_id=user_id, email=user_email, full_name=user_name)
            except Exception:
                await db.rollback()
        return user_id
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
) -> User:
    """
    Dependency to fetch the authenticated User ORM model from the database.
    Creates profile on-the-fly if token is valid but DB user row does not exist yet.
    """
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        user = await user_service.get_or_create_user(db, user_id=user_id, email=f"{user_id}@auth.supabase.local")
    return user
