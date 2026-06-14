import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from database import supabase
from services.image_service import analyze_product_image

router = APIRouter(prefix="/image", tags=["image"])

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


@router.post("/upload/{product_id}")
async def upload_image(product_id: str, file: UploadFile = File(...)):
    """Upload a diagnostic image to Supabase Storage and return public URL + pre-analysis."""
    file_bytes = await file.read()
    filename = file.filename or "image.jpg"
    ext = filename.split(".")[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG/PNG/WebP allowed")

    img_id = str(uuid.uuid4())
    path = f"diagnostic/{product_id}/{img_id}.{ext}"

    try:
        supabase.storage.from_("knowledge").upload(
            path, file_bytes, {"content-type": f"image/{ext}"}
        )
        url = supabase.storage.from_("knowledge").get_public_url(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

    # Pre-analyze the image
    try:
        analysis = await analyze_product_image(url)
    except Exception:
        analysis = "Image uploaded successfully. Describe what you see in this component."

    return {"image_url": url, "analysis": analysis}
