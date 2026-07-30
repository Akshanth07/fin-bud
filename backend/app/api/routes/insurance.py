from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.insurance import InsurancePolicyCreate, InsurancePolicyResponse, InsurancePolicyUpdate, OCRUploadResponse
from app.services.insurance_service import insurance_service
from app.services.user_service import user_service
from app.services.ocr_service import ocr_service
from app.services.insurance_analysis_service import insurance_analysis_service
from app.services.groq_service import groq_service
from app.utils.response import success_response

router = APIRouter(prefix="/insurance", tags=["Insurance"])

# Maximum upload file size: 10 MB
MAX_UPLOAD_SIZE = 10 * 1024 * 1024


@router.post("/upload", response_model=None, status_code=status.HTTP_200_OK)
async def upload_policy_document(
    file: UploadFile = File(...),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an insurance PDF or image file (PDF, PNG, JPG, JPEG).
    Extracts policy fields via PyMuPDF/OCR, runs rule engine analysis,
    and returns editable extracted fields with Groq AI explanation.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "png", "jpg", "jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG document."
        )

    # Enforce file size limit with bounded read (prevents memory exhaustion)
    file_bytes = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum allowed size of {MAX_UPLOAD_SIZE // (1024 * 1024)}MB."
        )
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    try:
        raw_text, confidence = ocr_service.extract_text_from_file(file_bytes, file.filename)
        extracted = ocr_service.parse_policy_data(raw_text, file.filename, confidence)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    # Fetch existing user policies to calculate portfolio coverage gap & health score
    existing_policies = await insurance_service.get_user_policies(db, user_id=user_id)
    user = await user_service.get_user_by_id(db, user_id)
    user_prof = {"monthly_income": float(user.monthly_income or 0.0), "annual_income": float(user.annual_income or 0.0)} if user else {}

    combined_policies = [
        {
            "company": p.company or p.provider,
            "policy_type": p.policy_type,
            "coverage_amount": float(p.coverage_amount or 0.0),
            "premium_amount": float(p.premium_amount or p.premium or 0.0),
            "premium_frequency": p.premium_frequency,
            "end_date": (p.end_date or p.renewal_date).isoformat() if (p.end_date or p.renewal_date) else None,
        }
        for p in existing_policies
    ]
    combined_policies.append(extracted)

    # Run Analysis Rule Engine
    analysis = insurance_analysis_service.analyze_user_insurance_portfolio(combined_policies, user_prof)

    # Run Groq AI Explanation
    ai_explanation = groq_service.explain_insurance_analysis(extracted, analysis)

    # Generate Validation Warnings
    validation_warnings = []
    if not extracted.get("company") or extracted.get("company") == "Insurance Provider":
        validation_warnings.append("Company name could not be automatically verified. Please review.")
    if not extracted.get("policy_number"):
        validation_warnings.append("Policy Number missing. Please enter policy number.")
    if extracted.get("coverage_amount", 0) <= 0:
        validation_warnings.append("Coverage Amount is 0. Please specify sum insured.")
    if extracted.get("premium_amount", 0) <= 0:
        validation_warnings.append("Premium Amount is 0. Please specify policy premium.")

    # Check duplicate policy number
    if extracted.get("policy_number"):
        is_dup = any(p.policy_number == extracted.get("policy_number") for p in existing_policies)
        if is_dup:
            validation_warnings.append(f"Warning: Policy number {extracted.get('policy_number')} already exists in your account.")

    result = {
        "extracted_data": extracted,
        "analysis": analysis,
        "ai_explanation": ai_explanation,
        "validation_warnings": validation_warnings,
    }

    return success_response(data=result, message="Policy document processed successfully")


@router.get("", response_model=None)
async def list_policies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all insurance policies and portfolio analysis for current user."""
    items = await insurance_service.get_user_policies(db, user_id=user_id, skip=skip, limit=limit)
    portfolio_analysis = await insurance_service.get_user_portfolio_analysis(db, user_id=user_id)

    response_data = [InsurancePolicyResponse.model_validate(item).model_dump(mode="json") for item in items]
    result = {
        "policies": response_data,
        "portfolio_analysis": portfolio_analysis,
    }

    return success_response(data=result, message="Insurance policies retrieved successfully")


@router.get("/{policy_id}", response_model=None)
async def get_policy(
    policy_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific insurance policy by ID with analysis and Groq AI explanation."""
    item = await insurance_service.get_policy(db, policy_id=policy_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance policy not found")

    user = await user_service.get_user_by_id(db, user_id)
    user_prof = {"monthly_income": float(user.monthly_income or 0.0)} if user else {}

    pol_dict = {
        "company": item.company or item.provider,
        "policy_number": item.policy_number,
        "policy_holder": item.policy_holder,
        "policy_type": item.policy_type,
        "plan_name": item.plan_name or item.policy_name,
        "coverage_amount": float(item.coverage_amount or 0.0),
        "premium_amount": float(item.premium_amount or item.premium or 0.0),
        "premium_frequency": item.premium_frequency,
        "start_date": item.start_date.isoformat() if item.start_date else None,
        "end_date": (item.end_date or item.renewal_date).isoformat() if (item.end_date or item.renewal_date) else None,
        "status": item.status,
    }

    portfolio_analysis = await insurance_service.get_user_portfolio_analysis(db, user_id=user_id)
    ai_explanation = groq_service.explain_insurance_analysis(pol_dict, portfolio_analysis)

    res_data = InsurancePolicyResponse.model_validate(item).model_dump(mode="json")
    res_data["analysis"] = portfolio_analysis
    res_data["ai_explanation"] = ai_explanation

    return success_response(data=res_data, message="Insurance policy retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_policy(
    obj_in: InsurancePolicyCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Save a new insurance policy entry."""
    item = await insurance_service.create_policy(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=InsurancePolicyResponse.model_validate(item).model_dump(mode="json"),
        message="Insurance policy created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.patch("/{policy_id}", response_model=None)
async def update_policy(
    policy_id: UUID,
    obj_in: InsurancePolicyUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing insurance policy record."""
    item = await insurance_service.update_policy(db, policy_id=policy_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance policy not found")
    return success_response(data=InsurancePolicyResponse.model_validate(item).model_dump(mode="json"), message="Insurance policy updated successfully")


@router.put("/{policy_id}", response_model=None)
async def put_update_policy(
    policy_id: UUID,
    obj_in: InsurancePolicyUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """PUT alias for updating an insurance policy."""
    item = await insurance_service.update_policy(db, policy_id=policy_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance policy not found")
    return success_response(data=InsurancePolicyResponse.model_validate(item).model_dump(mode="json"), message="Insurance policy updated successfully")


@router.delete("/{policy_id}", response_model=None)
async def delete_policy(
    policy_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an insurance policy record."""
    item = await insurance_service.delete_policy(db, policy_id=policy_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance policy not found")
    return success_response(message="Insurance policy deleted successfully")
