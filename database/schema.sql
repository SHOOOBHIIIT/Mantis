-- ══════════════════════════════════════════════════════════════
-- MANTIS — Supabase Database Schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────────
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  website_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  model_number    TEXT,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  image_url       TEXT,
  is_published    BOOLEAN DEFAULT false,
  moss_index_id   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- KNOWLEDGE DOCUMENTS (per product)
-- ─────────────────────────────────────────────
CREATE TABLE knowledge_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL,
  file_url        TEXT,
  external_url    TEXT,
  page_count      INTEGER,
  chunk_count     INTEGER DEFAULT 0,
  indexed         BOOLEAN DEFAULT false,
  indexing_error  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- DOCUMENT CHUNKS
-- ─────────────────────────────────────────────
CREATE TABLE document_chunks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  chunk_index     INTEGER NOT NULL,
  content         TEXT NOT NULL,
  page_number     INTEGER,
  section_tag     TEXT,
  char_count      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- DIAGNOSTIC SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE diagnostic_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_token   TEXT UNIQUE NOT NULL,
  status          TEXT DEFAULT 'active',
  diagnostic_step INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  content         TEXT NOT NULL,
  input_type      TEXT DEFAULT 'text',
  image_url       TEXT,
  sources         JSONB,
  retrieval_ms    INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Companies
CREATE POLICY "companies_select_all" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_insert_own" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "companies_update_own" ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "companies_delete_own" ON companies FOR DELETE USING (auth.uid() = user_id);

-- Products
CREATE POLICY "products_select_published" ON products FOR SELECT
  USING (is_published = true OR company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "products_insert_own" ON products FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "products_update_own" ON products FOR UPDATE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "products_delete_own" ON products FOR DELETE
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Knowledge docs
CREATE POLICY "docs_select_all" ON knowledge_documents FOR SELECT USING (true);
CREATE POLICY "docs_insert_own" ON knowledge_documents FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM products WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "docs_delete_own" ON knowledge_documents FOR DELETE
  USING (product_id IN (SELECT id FROM products WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- Chunks
CREATE POLICY "chunks_select_all" ON document_chunks FOR SELECT USING (true);

-- Sessions
CREATE POLICY "sessions_select_all" ON diagnostic_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert_all" ON diagnostic_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update_all" ON diagnostic_sessions FOR UPDATE USING (true);

-- Messages
CREATE POLICY "messages_select_all" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "messages_insert_all" ON chat_messages FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- STORAGE BUCKET
-- Run this after creating the bucket named "knowledge" in Storage UI
-- ─────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge', 'knowledge', true);
