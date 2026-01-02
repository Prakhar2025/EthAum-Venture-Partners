from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    website_url: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    trust_score: float

    class Config:
        orm_mode = True
