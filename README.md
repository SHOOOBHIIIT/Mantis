# ⚡ Mantis — AI Product Diagnostic Platform

> Every product deserves its own AI technician.

**Mantis** is a full-stack AI-powered diagnostic platform that turns product manuals into interactive troubleshooting assistants. Companies upload their documentation, and users get a guided, 6-step diagnostic experience — like having a senior field technician at their side.

🌐 **Live Demo:** [mantis-ruddy.vercel.app](https://mantis-ruddy.vercel.app)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 **Semantic Retrieval** | Sub-10ms knowledge retrieval from uploaded product manuals using keyword + MOSS indexing |
| 🧠 **6-Step Diagnostic Flow** | Structured intake → hypothesis → elimination → inspection → narrowing → resolution workflow |
| 🎤 **Voice Mode** | Speak your issue hands-free using the browser's Web Speech API — Mantis listens and responds via ElevenLabs TTS |
| 📷 **Image Diagnosis** | Upload a photo of the broken part — Gemini analyzes it and connects it to potential causes |
| 📄 **PDF Knowledge Ingestion** | Upload service manuals as PDFs. Mantis auto-chunks, classifies sections, and indexes them |
| 🔗 **Link & Video Bookmarks** | Attach reference URLs and YouTube videos to your product knowledge base |
| 🏢 **Company Dashboard** | Full product management: create products, upload manuals, track indexing status |
| 🔐 **Auth System** | Role-based authentication (company / user) powered by Supabase |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Zustand, Framer Motion, Lucide Icons |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | Supabase (PostgreSQL) |
| **AI Model** | Google Gemini (via `google-generativeai`) |
| **Voice** | Web Speech API (STT) + ElevenLabs (TTS) |
| **Hosting** | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### 1. Database Setup
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** and run the contents of `database/schema.sql` to create all tables.
3. In **Storage**, create a new public bucket named `knowledge`.

### 2. Environment Variables

**Backend** — Create `backend/.env` (see `backend/.env.example`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
FRONTEND_URL=http://localhost:3000
```

**Frontend** — Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Locally

**Option A — One-click (Windows):**
Double-click `start.bat` in the project root. It launches both servers automatically.

**Option B — Manual:**

Terminal 1 (Backend):
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Mantis/
├── backend/                 # FastAPI server
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # Login / Register
│   │   ├── products.py      # Product CRUD
│   │   ├── knowledge.py     # PDF upload & link management
│   │   ├── assistant.py     # AI chat endpoint
│   │   ├── voice.py         # STT & TTS
│   │   └── image.py         # Image upload & analysis
│   ├── services/            # Business logic
│   │   ├── assistant_service.py  # Gemini prompt engineering
│   │   ├── moss_service.py       # Retrieval (MOSS + DB fallback)
│   │   ├── pdf_service.py        # PDF chunking & classification
│   │   ├── voice_service.py      # ElevenLabs TTS
│   │   └── image_service.py      # Image analysis
│   ├── config.py            # Environment config
│   ├── database.py          # Supabase client
│   └── requirements.txt
├── frontend/                # Next.js 14 app
│   ├── app/                 # Pages (App Router)
│   ├── components/          # UI components
│   │   ├── assistant/       # Chat, voice, image components
│   │   ├── dashboard/       # Company dashboard components
│   │   ├── layout/          # Navbar, Footer
│   │   └── ui/              # Reusable design system
│   ├── stores/              # Zustand state management
│   ├── lib/                 # API client, utilities
│   └── types/               # TypeScript type definitions
├── database/                # SQL schema
└── start.bat                # One-click local startup (Windows)
```

---

## 🚢 Deployment

| Service | Platform | Root Directory |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | `frontend/` |
| Backend | [Render](https://render.com) | `backend/` |

> **Important:** Set `NEXT_PUBLIC_API_URL` on Vercel to your Render backend URL, and set `FRONTEND_URL` on Render to your Vercel frontend URL.

---

## 👥 Team

Built with ❤️ by **Vortex**


