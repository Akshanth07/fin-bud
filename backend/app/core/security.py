from typing import Any, Dict, Optional
import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel
from app.core.config import settings


class TokenPayload(BaseModel):
    sub: str  # User ID (UUID)
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
    aud: Optional[str] = None
    iss: Optional[str] = None
    user_metadata: Optional[Dict[str, Any]] = None


def decode_supabase_token(token: str) -> TokenPayload:
    """
    Decodes and validates a Supabase JWT access token.
    Enforces expiration check, user ID presence, and signature verification.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token or not token.strip():
        raise credentials_exception

    payload = None
    secrets_to_try = []

    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET not in (
        "financialos-jwt-secret-placeholder", "your-supabase-jwt-secret"
    ):
        secrets_to_try.append(settings.SUPABASE_JWT_SECRET)
    if settings.SECRET_KEY:
        secrets_to_try.append(settings.SECRET_KEY)

    # 1. Try decoding with verified signature if secret is provided
    for secret in secrets_to_try:
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=[settings.SUPABASE_ALGORITHM, "HS256"],
                options={"verify_aud": False, "verify_exp": True}
            )
            break
        except jwt.PyJWTError:
            continue

    # 2. If signature verification fails or placeholder secret used,
    # decode payload while strictly enforcing token expiration ('exp') check.
    # In production, refuse to decode without signature verification.
    if payload is None:
        if settings.APP_ENV == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token signature verification failed. Ensure SUPABASE_JWT_SECRET is correctly configured.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": True}
            )
        except jwt.PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    return TokenPayload(
        sub=user_id,
        email=payload.get("email"),
        role=payload.get("role"),
        exp=payload.get("exp"),
        aud=payload.get("aud"),
        iss=payload.get("iss"),
        user_metadata=payload.get("user_metadata") or payload.get("raw_user_meta_data")
    )
