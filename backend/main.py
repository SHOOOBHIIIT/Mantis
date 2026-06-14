from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, knowledge, assistant, voice, image
from config import settings

app = FastAPI(title="Mantis API", version="1.0.0", description="AI-powered product diagnostic platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(knowledge.router)
app.include_router(assistant.router)
app.include_router(voice.router)
app.include_router(image.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Mantis API"}
