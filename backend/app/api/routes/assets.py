from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate
from app.services.asset_service import asset_service
from app.utils.response import success_response

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=None)
async def list_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all asset records for current user (Cash, Savings, Gold, Real Estate, Vehicles)."""
    items = await asset_service.get_user_assets(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [AssetResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Assets retrieved successfully")


@router.get("/{asset_id}", response_model=None)
async def get_asset(
    asset_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific asset record by ID."""
    item = await asset_service.get_asset(db, asset_id=asset_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset record not found")
    return success_response(data=AssetResponse.model_validate(item).model_dump(mode="json"), message="Asset retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_asset(
    obj_in: AssetCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new asset entry."""
    item = await asset_service.create_asset(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=AssetResponse.model_validate(item).model_dump(mode="json"),
        message="Asset created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{asset_id}", response_model=None)
async def update_asset(
    asset_id: UUID,
    obj_in: AssetUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing asset record."""
    item = await asset_service.update_asset(db, asset_id=asset_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset record not found")
    return success_response(data=AssetResponse.model_validate(item).model_dump(mode="json"), message="Asset updated successfully")


@router.delete("/{asset_id}", response_model=None)
async def delete_asset(
    asset_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an asset record."""
    item = await asset_service.delete_asset(db, asset_id=asset_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset record not found")
    return success_response(message="Asset deleted successfully")
