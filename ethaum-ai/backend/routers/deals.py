"""EthAum AI - Deals Router (AppSumo-Inspired Enterprise Pilots).

This router provides low-cost enterprise pilot/POC functionality
backed by AI credibility scores. This is the AppSumo pillar of EthAum AI.

NOTE: This is MVP/Demo mode - all data is in-memory for hackathon demonstration.
"""

from fastapi import APIRouter, HTTPException

from schemas.deal import DealResponse, PilotRequest, PilotRequestResponse

router = APIRouter()

# In-memory deals data (demo mode)
DEALS: list[dict] = [
    {
        "id": 1,
        "product_id": 1,
        "startup_name": "NeuraTech",
        "pilot_title": "AI Analytics Suite - 30-Day Enterprise Trial",
        "description": "Full access to our AI-powered analytics platform with dedicated onboarding support. Perfect for enterprises looking to modernize their data stack.",
        "ideal_buyer": "Enterprise Fintech",
        "credibility_score": 92,
        "pilot_duration": "30 days",
        "status": "open",
    },
    {
        "id": 2,
        "product_id": 2,
        "startup_name": "CloudSync",
        "pilot_title": "DevOps Automation POC",
        "description": "Streamline your CI/CD pipelines with our AI-assisted DevOps platform. Includes migration support and 24/7 engineering assistance.",
        "ideal_buyer": "Tech Enterprise",
        "credibility_score": 87,
        "pilot_duration": "45 days",
        "status": "open",
    },
    {
        "id": 3,
        "product_id": 3,
        "startup_name": "FinLedger",
        "pilot_title": "Blockchain Compliance Pilot",
        "description": "Enterprise-grade blockchain compliance and audit trail solution. SOC2 certified, GDPR compliant.",
        "ideal_buyer": "Banking & Finance",
        "credibility_score": 78,
        "pilot_duration": "60 days",
        "status": "limited",
    },
]

# In-memory pilot requests log (demo mode)
PILOT_REQUESTS: list[dict] = []


@router.get("/", response_model=list[DealResponse])
def get_deals() -> list[DealResponse]:
    """
    Get all available enterprise pilot deals.
    
    These are low-cost POCs backed by AI credibility scores,
    replacing traditional AppSumo-style discounts with trust-verified pilots.
    """
    return [DealResponse(**deal) for deal in DEALS]


@router.post("/request", response_model=PilotRequestResponse)
def request_pilot(request: PilotRequest) -> PilotRequestResponse:
    """
    Submit a request for an enterprise pilot.
    
    MVP/Demo Mode: Logs the request in-memory and returns success.
    In production, this would notify the startup and create a formal POC agreement.
    """
    # Find the deal
    deal = next((d for d in DEALS if d["id"] == request.deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Log the request (demo mode)
    pilot_request = {
        "id": len(PILOT_REQUESTS) + 1,
        "deal_id": request.deal_id,
        "company_name": request.company_name,
        "contact_email": request.contact_email,
        "startup_name": deal["startup_name"],
        "status": "pending",
    }
    PILOT_REQUESTS.append(pilot_request)
    
    return PilotRequestResponse(
        success=True,
        message=f"Pilot request submitted successfully! {deal['startup_name']} will contact you within 24 hours. (Demo Mode)",
        deal_id=request.deal_id,
        company_name=request.company_name,
    )


@router.get("/requests")
def get_pilot_requests() -> list[dict]:
    """
    Get all pilot requests (admin endpoint for demo).
    """
    return PILOT_REQUESTS
