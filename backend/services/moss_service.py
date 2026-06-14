"""
MOSS service — wraps index creation, querying, and deletion.
Falls back to DB-backed keyword search when MOSS is not configured.
"""
import time
from typing import List, Dict, Tuple, Optional
from moss_client import get_moss


class _FallbackDoc:
    """Mimics the MOSS result document interface."""
    def __init__(self, chunk: Dict, score: float):
        self.text = chunk.get("content", "")
        self.score = score
        self.metadata = {
            "document_id": chunk.get("document_id", ""),
            "product_id": chunk.get("product_id", ""),
            "page_number": chunk.get("page_number", 0),
            "section_tag": chunk.get("section_tag", "general"),
            "chunk_index": chunk.get("chunk_index", 0),
        }


def _keyword_score(text: str, query: str) -> float:
    """Simple keyword overlap score for fallback retrieval."""
    text_lower = text.lower()
    query_words = query.lower().split()
    if not query_words:
        return 0.0
    hits = sum(1 for w in query_words if w in text_lower)
    return hits / len(query_words)


async def create_product_index(product_id: str, chunks: List[Dict]) -> None:
    """Create or overwrite a MOSS index for a product with its document chunks."""
    client = get_moss()
    index_name = f"product-{product_id}"

    if client is None:
        return  # DB-backed fallback, nothing to cache

    documents = [
        {
            "id": chunk["id"],
            "text": chunk["content"],
            "metadata": {
                "document_id": chunk.get("document_id", ""),
                "product_id": chunk.get("product_id", ""),
                "page_number": chunk.get("page_number", 0),
                "section_tag": chunk.get("section_tag", "general"),
                "chunk_index": chunk.get("chunk_index", 0),
            },
        }
        for chunk in chunks
    ]

    try:
        await client.create_index(index_name, documents)
        await client.load_index(index_name)
    except Exception:
        pass  # Fall through to DB-backed search on query


async def query_product_index(
    product_id: str,
    query: str,
    top_k: int = 5,
    section_filter: Optional[str] = None,
) -> Tuple[List, int]:
    """
    Query MOSS for relevant chunks.
    Returns (results, time_taken_ms).
    Falls back to DB keyword search when MOSS unavailable.
    """
    client = get_moss()

    start = time.time()

    if client is None:
        # ── DB-backed keyword search (works across server restarts) ────────────
        from database import supabase
        query_builder = supabase.table("document_chunks").select("*").eq("product_id", product_id)
        if section_filter:
            query_builder = query_builder.eq("section_tag", section_filter)

        res = query_builder.execute()
        chunks = res.data or []

        scored = []
        for chunk in chunks:
            score = _keyword_score(chunk.get("content", ""), query)
            scored.append(_FallbackDoc(chunk, score))

        scored.sort(key=lambda d: d.score, reverse=True)
        # Filter to only results with at least one keyword match
        scored = [d for d in scored if d.score > 0]
        elapsed_ms = int((time.time() - start) * 1000)
        return scored[:top_k], elapsed_ms

    # ── MOSS query ───────────────────────────────────────────────────────────
    try:
        await client.load_index(f"product-{product_id}")
    except Exception:
        pass  # already loaded

    try:
        from moss import QueryOptions  # type: ignore
        options = QueryOptions(top_k=top_k)
        if section_filter:
            options.filter = {"section_tag": {"$eq": section_filter}}

        results = await client.query(f"product-{product_id}", query, options)
        elapsed_ms = int((time.time() - start) * 1000)
        return results.docs, elapsed_ms
    except Exception:
        elapsed_ms = int((time.time() - start) * 1000)
        return [], elapsed_ms


async def delete_product_index(product_id: str) -> None:
    client = get_moss()

    if client is None:
        return

    try:
        await client.delete_index(f"product-{product_id}")
    except Exception:
        pass
