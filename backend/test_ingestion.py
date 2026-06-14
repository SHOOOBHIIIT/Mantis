import os
import sys
import time
import httpx
from dotenv import load_dotenv

# Load backend environment variables
load_dotenv(".env")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

from supabase import create_client, Client
supabase: Client = create_client(supabase_url, supabase_key)

def main():
    # 1. Get or create a product
    print("Checking for existing products...")
    res = supabase.table("products").select("id, name").limit(1).execute()
    
    if not res.data:
        print("No products found. Creating a dummy company and product...")
        comp_res = supabase.table("companies").insert({
            "name": "Test Company",
            "email": "test@example.com",
            "password_hash": "dummy"
        }).execute()
        comp_id = comp_res.data[0]["id"]
        
        prod_res = supabase.table("products").insert({
            "company_id": comp_id,
            "name": "Test Drone",
            "category": "drone",
            "description": "A test drone."
        }).execute()
        product_id = prod_res.data[0]["id"]
    else:
        product_id = res.data[0]["id"]
        print(f"Using existing product: {res.data[0]['name']} ({product_id})")

    # 2. Upload the PDF via the local API
    pdf_path = "../DJI_Mavic_3_User_Manual.pdf"
    if not os.path.exists(pdf_path):
        print(f"ERROR: Cannot find PDF at {pdf_path}")
        return

    print("Uploading PDF to local backend API...")
    url = f"http://127.0.0.1:8000/knowledge/upload/{product_id}"
    
    with open(pdf_path, "rb") as f:
        files = {"file": ("DJI_Mavic_3_User_Manual.pdf", f, "application/pdf")}
        data = {"title": "DJI Mavic 3 Pro Manual"}
        
        try:
            start_time = time.time()
            response = httpx.post(url, data=data, files=files, timeout=60.0)
            elapsed = time.time() - start_time
            print(f"Upload API returned in {elapsed:.2f} seconds.")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code != 200:
                print("Failed to upload via API.")
                return
            
            doc_id = response.json()["document_id"]
        except Exception as e:
            print(f"Exception calling API: {e}")
            return

    # 3. Wait for indexing to complete (it's a background task)
    print("Waiting for indexing to finish...")
    for _ in range(10):
        time.sleep(3)
        doc_res = supabase.table("knowledge_documents").select("indexed, indexing_error").eq("id", doc_id).execute()
        if doc_res.data:
            doc = doc_res.data[0]
            if doc["indexed"]:
                print("SUCCESS: Document has been fully indexed!")
                
                # Check chunks
                chunk_res = supabase.table("document_chunks").select("id", count="exact").eq("document_id", doc_id).execute()
                print(f"Successfully generated {chunk_res.count} chunks.")
                return
            elif doc["indexing_error"]:
                print(f"ERROR: Indexing failed with error: {doc['indexing_error']}")
                return
        print("Still indexing...")
        
    print("WARNING: Indexing is taking longer than expected. Check the backend logs.")

if __name__ == "__main__":
    main()
