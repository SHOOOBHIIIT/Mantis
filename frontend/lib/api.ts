import axios from 'axios';
import type {
  Product,
  ProductListResponse,
  KnowledgeDocument,
  ChatResponse,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mantis_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    role: 'company' | 'user';
    company_name?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => api.get<ProductListResponse>('/products', { params }),

  get: (id: string) => api.get<Product>(`/products/${id}`),

  getByCompany: (companyId: string) =>
    api.get<Product[]>(`/products/company/${companyId}`),

  create: (
    data: {
      name: string;
      model_number?: string;
      category: string;
      description: string;
      image_url?: string;
    },
    companyId: string
  ) => api.post<Product>(`/products?company_id=${companyId}`, data),

  update: (
    id: string,
    data: Partial<{
      name: string;
      model_number: string;
      category: string;
      description: string;
      image_url: string;
      is_published: boolean;
    }>
  ) => api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),
};

// ─── Knowledge ────────────────────────────────────────────────────────────────
export const knowledgeAPI = {
  list: (productId: string) =>
    api.get<KnowledgeDocument[]>(`/knowledge/${productId}`),

  uploadPDF: (productId: string, file: File, title: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    return api.post(`/knowledge/upload/${productId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addLink: (productId: string, data: { title: string; type: string; external_url: string }) =>
    api.post(`/knowledge/link/${productId}`, data),

  delete: (documentId: string) => api.delete(`/knowledge/${documentId}`),
};

// ─── Assistant ────────────────────────────────────────────────────────────────
export const assistantAPI = {
  chat: (data: {
    session_token: string;
    product_id: string;
    message: string;
    input_type?: string;
    image_url?: string;
    conversation_history?: Array<{ role: string; content: string }>;
  }) => api.post<ChatResponse>('/assistant/chat', data),
};

// ─── Voice ────────────────────────────────────────────────────────────────────
export const voiceAPI = {
  transcribe: (audioBlob: Blob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'audio.webm');
    return api.post<{ transcript: string }>('/voice/transcribe', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  speak: (text: string) =>
    api.post('/voice/speak', { text }, { responseType: 'blob' }),
};

// ─── Image ────────────────────────────────────────────────────────────────────
export const imageAPI = {
  upload: (productId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ image_url: string; analysis: string }>(
      `/image/upload/${productId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

export default api;
