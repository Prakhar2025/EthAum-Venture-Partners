"""EthAum AI - Deals Router with Supabase Database (AppSumo-Inspired Enterprise Pilots)."""

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.deal import DealResponse, PilotRequest, PilotRequestResponse

router = APIRouter()


@router.get("/", response_model=list[DealResponse])
def get_deals() -> list[DealResponse]:
    """
    Get all available enterprise pilot deals.
    
    These are low-cost POCs backed by AI credibility scores,
    replacing traditional AppSumo-style discounts with trust-verified pilots.
    """
    db = get_db()
    
    # Join deals with products to get startup names and credibility scores
    deals_result = db.table("deals").select("*").eq("is_active", True).execute()
    
    formatted_deals = []
    for deal in deals_result.data or []:
        # Get product info
        product_result = db.table("products").select("name, trust_score").eq("id", deal["product_id"]).execute()
        product = product_result.data[0] if product_result.data else {"name": "Unknown", "trust_score": 0}
        
        formatted_deals.append(DealResponse(
            id=deal["id"],
            product_id=deal["product_id"],
            startup_name=product["name"],
            pilot_title=deal["title"],
            description=deal["description"] or "",
            ideal_buyer="Enterprise",
            credibility_score=product["trust_score"],
            pilot_duration=f"{deal['trial_days']} days",
            status="open" if deal["is_active"] else "closed",
        ))
    
    return formatted_deals


@router.post("/request", response_model=PilotRequestResponse)
def request_pilot(request: PilotRequest) -> PilotRequestResponse:
    """
    Submit a request for an enterprise pilot.
    """
    db = get_db()
    
    # Find the deal
    deal_result = db.table("deals").select("*, products(name)").eq("id", request.deal_id).execute()
    
    if not deal_result.data:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    deal = deal_result.data[0]
    
    # Get product name
    product_result = db.table("products").select("name").eq("id", deal["product_id"]).execute()
    startup_name = product_result.data[0]["name"] if product_result.data else "Unknown"
    
    # Create pilot request in database
    result = db.table("pilot_requests").insert({
        "deal_id": request.deal_id,
        "company_name": request.company_name,
        "email": request.contact_email,
        "message": getattr(request, 'message', None),
        "status": "pending",
    }).execute()
    
    return PilotRequestResponse(
        success=True,
        message=f"Pilot request submitted successfully! {startup_name} will contact you within 24 hours.",
        deal_id=request.deal_id,
        company_name=request.company_name,
    )


@router.get("/requests")
def get_pilot_requests() -> list[dict]:
    """Get all pilot requests (admin endpoint)."""
    db = get_db()
    result = db.table("pilot_requests").select("*").execute()
    return result.data or []
