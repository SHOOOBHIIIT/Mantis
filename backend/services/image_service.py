import asyncio
from functools import partial
import google.generativeai as genai
from config import settings

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

IMAGE_ANALYSIS_PROMPT = """You are analyzing a product image for diagnostic purposes.
Describe exactly what you see:
1. What component or part is shown?
2. What visual abnormalities, damage, or wear are visible? (burns, corrosion, leaks, cracks, discoloration, etc.)
3. What is the likely condition status? (new/good, worn, damaged, failed)
4. What diagnostic clues does this image provide?

Be specific and factual. Use technical terms when appropriate. Keep to 3-4 sentences."""


async def analyze_product_image(image_url: str) -> str:
    """Pre-analyze an uploaded image using Gemini Vision."""
    if not settings.gemini_api_key:
        return "Image uploaded. Describe what you see and I'll help diagnose the issue."

    model = genai.GenerativeModel("gemini-flash-latest")

    # Use the image URL directly
    import httpx, base64
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            image_b64 = base64.b64encode(resp.content).decode("utf-8")
            mime_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
    except Exception:
        return "Image uploaded successfully. Describe what you see in this component."

    loop = asyncio.get_event_loop()
    try:
        response = await loop.run_in_executor(
            None,
            partial(
                model.generate_content,
                [{"mime_type": mime_type, "data": base64.b64decode(image_b64)}, IMAGE_ANALYSIS_PROMPT]
            )
        )
        return response.text.strip()
    except Exception:
        return "Image uploaded successfully. Describe what you see in this component."
