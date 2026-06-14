from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from services.voice_service import transcribe_audio
import httpx
import io
from config import settings

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    if len(audio_bytes) < 500:
        raise HTTPException(status_code=400, detail="Audio too short or empty")
    text = await transcribe_audio(audio_bytes, audio.filename or "audio.webm")
    return {"transcript": text}


@router.post("/speak")
async def text_to_speech(body: dict):
    """Convert text to speech. Uses ElevenLabs if configured and working, else Google TTS."""
    text = body.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    # Trim very long responses to first 500 chars for TTS
    tts_text = text[:500] + ("..." if len(text) > 500 else "")

    # ── Try ElevenLabs first if API key exists ────────────────────────────────
    if settings.elevenlabs_api_key:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.elevenlabs_voice_id}"
        headers = {
            "xi-api-key": settings.elevenlabs_api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "text": tts_text,
            "model_id": "eleven_turbo_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.8},
        }
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                return Response(content=resp.content, media_type="audio/mpeg")
        except Exception:
            pass  # Fall through to Google TTS

    # ── Fallback: Google TTS (completely free, no key needed) ─────────────────
    try:
        from gtts import gTTS
        import asyncio
        from functools import partial

        loop = asyncio.get_event_loop()
        tts = gTTS(text=tts_text, lang="en", slow=False)
        buf = io.BytesIO()
        await loop.run_in_executor(None, partial(tts.write_to_fp, buf))
        buf.seek(0)
        return Response(content=buf.read(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"TTS unavailable: {str(e)}")
