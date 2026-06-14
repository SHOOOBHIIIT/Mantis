from fastapi import APIRouter, HTTPException
from models.schemas import RegisterRequest, LoginRequest
from database import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(body: RegisterRequest):
    # 1. Create Supabase auth user
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
        # If user.identities is empty, the user already exists in Supabase Auth
        if res.user and not res.user.identities:
            raise HTTPException(status_code=400, detail="Email is already registered")
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed. Check your email or password.")
        user_id = res.user.id
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e)
        if "already registered" in err_msg.lower():
            raise HTTPException(status_code=400, detail="Email is already registered")
        raise HTTPException(status_code=400, detail=err_msg)

    # 2. If company role, create company record
    if body.role == "company":
        if not body.company_name:
            raise HTTPException(status_code=400, detail="company_name is required for company accounts")
        try:
            supabase.table("companies").insert({
                "user_id": user_id,
                "name": body.company_name,
            }).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Company record creation failed: {e}")

    return {"message": "Account created", "user_id": user_id, "role": body.role}


@router.post("/login")
async def login(body: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        user = res.user
        session = res.session
        if not user or not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check if company account
    company_res = supabase.table("companies").select("*").eq("user_id", user.id).maybe_single().execute()
    role = "company" if company_res.data else "user"

    return {
        "access_token": session.access_token,
        "user_id": user.id,
        "email": user.email,
        "role": role,
        "company": company_res.data,
    }
