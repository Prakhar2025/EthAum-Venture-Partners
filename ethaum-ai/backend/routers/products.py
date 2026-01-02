from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def create_product_submission():
    return {"message": "Submit product endpoint (TODO)"}

@router.get("/")
def list_products():
    return [{"name": "Startup A", "trust_score": 95}]

@router.get("/{product_id}")
def get_product(product_id: int):
    return {"name": "Startup A", "id": product_id}
