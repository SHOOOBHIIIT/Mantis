// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: 'company' | 'user';
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  access_token: string | null;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export type ProductCategory =
  | 'scooter'
  | 'ac'
  | 'washing_machine'
  | 'electronics'
  | 'appliance'
  | 'other';

export interface Product {
  id: string;
  company_id: string;
  name: string;
  model_number?: string;
  category: ProductCategory;
  description: string;
  image_url?: string;
  is_published: boolean;
  moss_index_id?: string;
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
    logo_url?: string;
    description?: string;
  };
  knowledge_documents?: KnowledgeDocument[];
}

// ─── Knowledge ────────────────────────────────────────────────────────────────
export type DocumentType = 'pdf' | 'text' | 'link' | 'video_link';

export interface KnowledgeDocument {
  id: string;
  product_id: string;
  title: string;
  type: DocumentType;
  file_url?: string;
  external_url?: string;
  page_count?: number;
  chunk_count: number;
  indexed: boolean;
  indexing_error?: string;
  created_at: string;
}

// ─── Assistant ────────────────────────────────────────────────────────────────
export type InputType = 'text' | 'voice' | 'image';

export interface SourceCitation {
  doc_title: string;
  page?: number;
  section?: string;
  score: number;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  input_type: InputType;
  image_url?: string;
  sources?: SourceCitation[];
  retrieval_ms?: number;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  sources: SourceCitation[];
  retrieval_ms: number;
  diagnostic_step: number;
  session_token: string;
}

// ─── API responses ─────────────────────────────────────────────────────────────
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
