import os
import tempfile
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from models.schemas import DocumentLinkCreate
from database import supabase
from services.pdf_service import extract_chunks_and_count
from services.moss_service import create_product_index

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


async def _index_product(product_id: str):
    """Background task: pull all chunks for a product and rebuild MOSS index."""
    chunks_res = supabase.table("document_chunks").select("*").eq("product_id", product_id).execute()
    if not chunks_res.data:
        return

    try:
        await create_product_index(product_id, chunks_res.data)
        supabase.table("products").update(
            {"moss_index_id": f"product-{product_id}"}
        ).eq("id", product_id).execute()
        # Mark all docs as indexed
        supabase.table("knowledge_documents").update(
            {"indexed": True, "indexing_error": None}
        ).eq("product_id", product_id).execute()
    except Exception as e:
        supabase.table("knowledge_documents").update(
            {"indexing_error": str(e)}
        ).eq("product_id", product_id).execute()


def _process_pdf_background(file_bytes: bytes, doc_id: str, product_id: str, title: str, file_url: str):
    """Background task: parse PDF, insert chunks, then trigger MOSS indexing."""
    import asyncio

    # Save temp file for parsing
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        chunks, page_count = extract_chunks_and_count(tmp_path, doc_id, product_id)
    except Exception as e:
        supabase.table("knowledge_documents").update(
            {"indexing_error": f"PDF parsing failed: {e}"}
        ).eq("id", doc_id).execute()
        return
    finally:
        os.unlink(tmp_path)

    # Update document record with page/chunk counts
    supabase.table("knowledge_documents").update({
        "page_count": page_count,
        "chunk_count": len(chunks),
    }).eq("id", doc_id).execute()

    # Save chunks to DB in batches of 100
    chunk_rows = [
        {
            "document_id": doc_id,
            "product_id": product_id,
            "chunk_index": c["chunk_index"],
            "content": c["content"],
            "page_number": c["page_number"],
            "section_tag": c["section_tag"],
            "char_count": c["char_count"],
        }
        for c in chunks
    ]

    for i in range(0, len(chunk_rows), 100):
        supabase.table("document_chunks").insert(chunk_rows[i : i + 100]).execute()

    # Trigger MOSS indexing
    asyncio.run(_index_product(product_id))


@router.get("/{product_id}")
async def get_documents(product_id: str):
    result = supabase.table("knowledge_documents").select("*").eq("product_id", product_id).order("created_at", desc=True).execute()
    return result.data


@router.post("/upload/{product_id}")
async def upload_document(
    product_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    doc_id = str(uuid.uuid4())
    storage_path = f"products/{product_id}/{doc_id}.pdf"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_("knowledge").upload(
            storage_path, file_bytes, {"content-type": "application/pdf"}
        )
        file_url = supabase.storage.from_("knowledge").get_public_url(storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    # Save document record immediately (so the UI can show it)
    supabase.table("knowledge_documents").insert({
        "id": doc_id,
        "product_id": product_id,
        "title": title,
        "type": "pdf",
        "file_url": file_url,
        "page_count": 0,
        "chunk_count": 0,
        "indexed": False,
    }).execute()

    # Move all heavy work (PDF parsing, chunking, indexing) to background
    background_tasks.add_task(
        _process_pdf_background, file_bytes, doc_id, product_id, title, file_url
    )

    return {
        "document_id": doc_id,
        "title": title,
        "message": "Document uploaded. Parsing and indexing in background.",
    }


@router.post("/link/{product_id}")
async def add_link(product_id: str, body: DocumentLinkCreate):
    result = supabase.table("knowledge_documents").insert({
        "product_id": product_id,
        "title": body.title,
        "type": body.type,
        "external_url": body.external_url,
        "indexed": True,
    }).execute()
    return result.data[0]


@router.delete("/{document_id}")
async def delete_document(document_id: str, background_tasks: BackgroundTasks):
    doc_res = supabase.table("knowledge_documents").select("*").eq("id", document_id).maybe_single().execute()
    if not doc_res.data:
        raise HTTPException(status_code=404, detail="Document not found")

    product_id = doc_res.data["product_id"]

    supabase.table("document_chunks").delete().eq("document_id", document_id).execute()
    supabase.table("knowledge_documents").delete().eq("id", document_id).execute()

    # Re-index product
    background_tasks.add_task(_index_product, product_id)

    return {"message": "Document deleted and index rebuilding"}

