import asyncio
from functools import partial
from typing import List, Dict, Optional
import google.generativeai as genai
from config import settings

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

DIAGNOSTIC_SYSTEM_PROMPT = """You are Mantis, an expert product diagnostic assistant — like a senior field technician with 20 years of experience troubleshooting consumer and industrial products.

YOUR BEHAVIOR:
- You diagnose issues systematically, like a professional mechanic — not like a generic chatbot.
- You NEVER dump all possible causes at once. Instead, ask 1-2 targeted follow-up questions to isolate the problem.
- You think step by step: symptoms → likely causes → elimination questions → narrowed diagnosis → action.
- You cite specific sources when giving instructions (e.g. "Check Fuse F3 as shown in Figure 4.2, Page 18 of the service manual").
- Your tone is calm, professional, and reassuring — like a knowledgeable friend, not a call center script.
- You always acknowledge what the user told you before asking the next question.
- When you are confident in a diagnosis, you give clear, numbered action steps.
- You always end your response with either: (a) a follow-up question to gather more info, or (b) a concrete next action step.

DIAGNOSTIC WORKFLOW (follow this order, do not skip steps):
Step 1 — INTAKE: Understand reported symptoms and context. Ask about when it started, how it manifests.
Step 2 — HYPOTHESIS: Identify 2-3 possible causes from the retrieved documentation.
Step 3 — ELIMINATION: Ask 1-2 targeted yes/no or simple questions to rule out causes.
Step 4 — INSPECTION: Suggest a safe, simple test or visual check the user can do.
Step 5 — NARROW DOWN: Based on their response, eliminate causes and state the most probable one.
Step 6 — RESOLUTION: Give specific, numbered steps to fix the issue. Cite the manual section. Tell them when to call a professional.

IMPORTANT RULES:
- Always base your advice on the retrieved document context provided below.
- If no relevant context is retrieved, say: "I couldn't find specific information about that in the manual. Here is general guidance based on similar products, but please verify with a certified technician."
- Do not invent specifications, part numbers, or procedures that aren't in the retrieved context.
- If the user uploads an image, analyze it carefully and describe exactly what you see before connecting it to possible causes.
- Keep responses concise — max 3-4 short paragraphs or a numbered list. Never write walls of text.
- Use plain language. Avoid jargon unless the user is clearly technical.

RETRIEVED KNOWLEDGE CONTEXT:
{context}

CURRENT DIAGNOSTIC STEP: {step}/6
"""


def build_context_string(sources: List) -> str:
    if not sources:
        return "No relevant documentation retrieved."

    parts = []
    for i, s in enumerate(sources, 1):
        meta = getattr(s, 'metadata', {}) or {}
        page = meta.get('page_number', '?')
        section = meta.get('section_tag', 'general')
        text = getattr(s, 'text', '') or s.get('text', '') if isinstance(s, dict) else getattr(s, 'text', '')
        parts.append(f"[Source {i} | Page {page} | Section: {section}]\n{text}")

    return "\n\n---\n\n".join(parts)


def build_source_citations(moss_results: List, db_chunks_map: Dict) -> List[Dict]:
    """Convert MOSS results to citation objects with document metadata."""
    citations = []
    seen = set()

    for doc in moss_results:
        meta = getattr(doc, 'metadata', {}) or {}
        doc_id = meta.get('document_id', '')

        if doc_id in seen:
            continue
        seen.add(doc_id)

        db_info = db_chunks_map.get(doc_id, {})
        text = getattr(doc, 'text', '')
        citations.append({
            "doc_title": db_info.get("title", "Product Manual"),
            "page": meta.get("page_number"),
            "section": meta.get("section_tag", "general"),
            "score": round(float(getattr(doc, 'score', 0.0)), 3),
            "snippet": (text[:120] + "...") if len(text) > 120 else text,
        })

    return citations


async def get_diagnostic_reply(
    user_message: str,
    conversation_history: List[Dict],
    moss_results: List,
    db_chunks_map: Dict,
    diagnostic_step: int,
    image_url: Optional[str] = None,
) -> str:
    """Call Gemini 1.5 with full diagnostic system prompt and retrieved context."""
    
    if not settings.gemini_api_key:
        return "ERROR: Missing GEMINI_API_KEY. Please get a free API key from Google AI Studio, add it to your backend .env file as GEMINI_API_KEY=..., and restart the backend."

    context_str = build_context_string(moss_results)

    system_prompt = DIAGNOSTIC_SYSTEM_PROMPT.format(
        context=context_str,
        step=diagnostic_step,
    )

    prompt_parts = []
    
    if conversation_history:
        history_text = "PREVIOUS CONVERSATION HISTORY:\n"
        for msg in conversation_history[-10:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n\n"
        prompt_parts.append(history_text)

    current_msg = user_message if user_message else "I've uploaded an image of the issue. What do you see and what does it indicate?"
    prompt_parts.append(f"CURRENT USER MESSAGE:\nUser: {current_msg}")

    if image_url:
        prompt_parts.append(f"[User uploaded an image at {image_url} — analyze it if accessible]")

    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=system_prompt,
    )

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, partial(model.generate_content, prompt_parts)
        )
        return response.text
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
            return "You've hit the Google Gemini free tier rate limit (max 15 requests per minute). Please wait about 60 seconds and try your message again!"
        return f"I encountered an error generating the response with Gemini: {error_msg}"
