from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from database import supabase
from services.moss_service import query_product_index
from services.assistant_service import get_diagnostic_reply, build_source_citations

router = APIRouter(prefix="/assistant", tags=["assistant"])


def _advance_step(current_step: int, message_count: int) -> int:
    """Advance diagnostic step based on conversation depth."""
    if message_count <= 2:
        return 1
    elif message_count <= 4:
        return 2
    elif message_count <= 6:
        return 3
    elif message_count <= 8:
        return 4
    elif message_count <= 10:
        return 5
    return 6


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    # 1. Get or create session
    session_res = supabase.table("diagnostic_sessions").select("*").eq(
        "session_token", body.session_token
    ).maybe_single().execute()

    session_data = session_res.data if session_res else None

    if not session_data:
        session_insert = supabase.table("diagnostic_sessions").insert({
            "product_id": body.product_id,
            "session_token": body.session_token,
            "status": "active",
            "diagnostic_step": 1,
        }).execute()
        session_id = session_insert.data[0]["id"]
        current_step = 1
    else:
        session_id = session_data["id"]
        current_step = session_data.get("diagnostic_step", 1)

    message_count = len(body.conversation_history)
    new_step = _advance_step(current_step, message_count)

    # 2. Query MOSS for relevant context
    section_filter = "troubleshooting" if new_step <= 3 else None
    moss_results, retrieval_ms = await query_product_index(
        product_id=body.product_id,
        query=body.message,
        top_k=5,
        section_filter=section_filter,
    )

    # 3. Get document metadata for citations
    doc_ids = list(set([
        (getattr(r, 'metadata', {}) or {}).get('document_id', '')
        for r in moss_results
        if (getattr(r, 'metadata', {}) or {}).get('document_id')
    ]))
    db_chunks_map: dict = {}
    if doc_ids:
        docs_res = supabase.table("knowledge_documents").select("id, title").in_("id", doc_ids).execute()
        db_chunks_map = {d["id"]: d for d in docs_res.data}

    # 4. Get AI reply
    reply = await get_diagnostic_reply(
        user_message=body.message,
        conversation_history=body.conversation_history,
        moss_results=moss_results,
        db_chunks_map=db_chunks_map,
        diagnostic_step=new_step,
        image_url=body.image_url,
    )

    sources = build_source_citations(moss_results, db_chunks_map)

    # 5. Save messages to DB
    supabase.table("chat_messages").insert([
        {
            "session_id": session_id,
            "role": "user",
            "content": body.message,
            "input_type": body.input_type,
            "image_url": body.image_url,
        },
        {
            "session_id": session_id,
            "role": "assistant",
            "content": reply,
            "sources": sources,
            "retrieval_ms": retrieval_ms,
        },
    ]).execute()

    # 6. Update session step
    supabase.table("diagnostic_sessions").update({
        "diagnostic_step": new_step
    }).eq("id", session_id).execute()

    return ChatResponse(
        reply=reply,
        sources=sources,
        retrieval_ms=retrieval_ms,
        diagnostic_step=new_step,
        session_token=body.session_token,
    )
