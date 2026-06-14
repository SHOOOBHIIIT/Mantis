from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.schemas import ProductCreate, ProductUpdate
from database import supabase

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
async def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
):
    offset = (page - 1) * limit
    query = supabase.table("products").select(
        "*, companies(name, logo_url)", count="exact"
    ).eq("is_published", True)

    if category:
        query = query.eq("category", category)
    if search:
        query = query.ilike("name", f"%{search}%")

    result = query.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
    return {"products": result.data, "total": result.count, "page": page, "limit": limit}


@router.get("/company/{company_id}")
async def get_company_products(company_id: str):
    result = supabase.table("products").select(
        "*, knowledge_documents(id, title, indexed)"
    ).eq("company_id", company_id).order("created_at", desc=True).execute()
    return result.data


@router.get("/{product_id}")
async def get_product(product_id: str):
    result = supabase.table("products").select(
        "*, companies(name, logo_url, description), knowledge_documents(*)"
    ).eq("id", product_id).maybe_single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return result.data


@router.post("")
async def create_product(body: ProductCreate, company_id: str):
    result = supabase.table("products").insert({
        **body.model_dump(),
        "company_id": company_id,
        "moss_index_id": None,
    }).execute()
    return result.data[0]


@router.put("/{product_id}")
async def update_product(product_id: str, body: ProductUpdate):
    result = supabase.table("products").update(
        body.model_dump(exclude_none=True)
    ).eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return result.data[0]


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    from services.moss_service import delete_product_index
    await delete_product_index(product_id)
    supabase.table("products").delete().eq("id", product_id).execute()
    return {"message": "Product deleted"}
