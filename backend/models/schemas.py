from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    COMPANY = "company"
    USER = "user"


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: UserRole
    company_name: Optional[str] = None  # required if role == company


class LoginRequest(BaseModel):
    email: str
    password: str


class ProductCreate(BaseModel):
    name: str
    model_number: Optional[str] = None
    category: str
    description: str
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    model_number: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None


class DocumentLinkCreate(BaseModel):
    title: str
    type: str   # 'link' | 'video_link'
    external_url: str


class ChatRequest(BaseModel):
    session_token: str
    product_id: str
    message: str
    input_type: str = "text"   # 'text' | 'voice' | 'image'
    image_url: Optional[str] = None
    conversation_history: List[dict] = []


class SourceCitation(BaseModel):
    doc_title: str
    page: Optional[int] = None
    section: Optional[str] = None
    score: float
    snippet: str


class ChatResponse(BaseModel):
    reply: str
    sources: List[SourceCitation]
    retrieval_ms: int
    diagnostic_step: int
    session_token: str
