# Mantis — AI Product Diagnostic Platform

Mantis gives every product its own AI diagnostic expert — a technician that reads the manual, asks the right questions, and guides you to the root cause in minutes.

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** and copy-paste the contents of `database/schema.sql`. Run it to create all tables and RLS policies.
3. In the Supabase Dashboard, go to **Storage** and create a new public bucket named `knowledge`.

### 2. Environment Variables
You need two `.env` files. We have provided templates.

**Backend (`backend/.env`):**
(Copy from `backend/.env.example` and fill in your keys)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
MOSS_PROJECT_ID=your_moss_project_id
MOSS_PROJECT_KEY=your_moss_project_key
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Backend (FastAPI)
Open a terminal and run:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 4. Start the Frontend (Next.js)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🎨 Tech Stack
* **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand, React Query, Lucide Icons
* **Backend**: FastAPI, Supabase (PostgreSQL + pgvector), OpenAI (GPT-4o), ElevenLabs (TTS)
* **Search Engine**: @moss-dev/moss (Sub-10ms semantic retrieval)

Enjoy building and diagnosing with Mantis!
