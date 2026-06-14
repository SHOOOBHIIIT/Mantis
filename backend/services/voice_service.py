import asyncio
import base64
import tempfile
import os
from functools import partial
import google.generativeai as genai
from config import settings

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Use Gemini to transcribe audio to text."""
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    suffix = "." + filename.split(".")[-1] if "." in filename else ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        # Upload audio file to Gemini Files API
        loop = asyncio.get_event_loop()
        audio_file = await loop.run_in_executor(
            None,
            partial(genai.upload_file, tmp_path, mime_type="audio/webm")
        )

        model = genai.GenerativeModel("gemini-flash-latest")
        response = await loop.run_in_executor(
            None,
            partial(
                model.generate_content,
                ["Transcribe the following audio exactly as spoken. Return only the transcription text with no commentary, labels, or formatting.", audio_file]
            )
        )
        return response.text.strip()
    finally:
        os.unlink(tmp_path)
