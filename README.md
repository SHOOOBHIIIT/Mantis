# ⚡ Mantis — AI Product Diagnostic Platform

> Every product deserves its own AI technician.

## 👥 Team Details
- **Team Name:** Vertex
- **Team Members:** Sanskar Srivastava, Shobhit Chaturvedi, Shatrunjay Singh, Sarvesh Kumar

## 📖 Project Overview
Mantis is a full-stack AI-powered diagnostic platform that turns product manuals into interactive troubleshooting assistants. Companies upload their documentation, and users get a guided, 6-step diagnostic experience — like having a senior field technician at their side.

🌐 **Live Demo:** [mantis-ruddy.vercel.app](https://mantis-ruddy.vercel.app)

## ✨ Features and Functionality
- **🔍 Semantic Retrieval:** Sub-10ms knowledge retrieval from uploaded product manuals using keyword + MOSS indexing.
- **🧠 6-Step Diagnostic Flow:** Structured intake → hypothesis → elimination → inspection → narrowing → resolution workflow.
- **🎤 Voice Mode:** Speak your issue hands-free using the browser's Web Speech API — Mantis listens and responds via ElevenLabs TTS.
- **📷 Image Diagnosis:** Upload a photo of the broken part — Gemini analyzes it and connects it to potential causes.
- **📄 PDF Knowledge Ingestion:** Upload service manuals as PDFs. Mantis auto-chunks, classifies sections, and indexes them.
- **🔗 Link & Video Bookmarks:** Attach reference URLs and YouTube videos to your product knowledge base.
- **🏢 Company Dashboard:** Full product management: create products, upload manuals, track indexing status.
- **🔐 Auth System:** Role-based authentication (company / user) powered by Supabase.

---

## 🏗️ 1. High-Level Architecture
Mantis is a decoupled application using a modern React frontend and a Python AI backend, connected via REST APIs and sharing a Supabase database.

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion for animations. Hosted on Vercel.
- **Backend:** FastAPI (Python), PyMuPDF (for PDF processing). Hosted on Render.
- **Database & Auth:** Supabase (PostgreSQL). Stores users, companies, products, and raw chunks of knowledge base text.
- **AI / LLM Stack:**
  - **Retrieval:** Custom MOSS implementation (Massive Online Semantic Search) for hyper-fast (<10ms) context gathering.
  - **Logic / Inference:** Gemini (Primary) and GPT-4o (Vision) via `google-generativeai` and `openai` Python SDKs.
  - **Voice TTS:** ElevenLabs API for high-fidelity spoken responses.

## 📂 2. Codebase Structure Breakdown

### Frontend (`/frontend`)
The frontend is strictly focused on UI/UX, animations, and state management. It does not process PDFs or talk to LLMs directly.
- `app/`: Next.js App Router structure. Contains pages like `/dashboard`, `/products`, and `/products/[id]` (the actual AI chat interface).
- `components/assistant/`: Core logic for the chat UI.
  - `MessageBubble.tsx`: Renders user/AI messages. Handles the "thinking" states and markdown rendering of the AI's response.
  - `DiagnosticProgress.tsx`: The visual 6-step progress bar on the left side of the chat.
  - `InputBar.tsx`: Manages text input, microphone (voice) recording, and image uploading.
- `components/dashboard/`: B2B interface.
  - `KnowledgeUploader.tsx`: Handles drag-and-drop PDF uploads and sending YouTube links to the backend.

### Backend (`/backend`)
The backend is the brain. It runs as a FastAPI server handling intense processing.
- `routers/`: The API endpoints.
  - `knowledge.py`: Receives PDFs. Dispatches them to a Background Task to avoid timing out the HTTP request.
  - `assistant.py`: The core chat endpoint. Takes user queries, triggers MOSS retrieval, and asks the LLM for a response.
  - `image.py`: Handles base64 encoded images sent from the frontend and passes them to GPT-4o Vision.
  - `voice.py`: Sends AI text responses to ElevenLabs and streams back the MP3 audio bytes.
- `services/`: The actual business logic.
  - `pdf_service.py`: Uses `fitz` (PyMuPDF) to read pages, strip text, break it into logical chunks, and insert them into Supabase.
  - `moss_service.py`: The retrieval engine. Scores chunks based on keyword matching (with stop-word filtering) against the user's query.
  - `assistant_service.py`: Constructs the massive prompt for Gemini. This is where the "6-step flow", "citation enforcement", and "off-topic handling" logic lives.

## 🧠 3. The Core AI Pipeline: How It Actually Works

### Phase A: Ingestion (When a Company Uploads a Manual)
1. **Upload:** Frontend sends a PDF to `/api/knowledge/upload`.
2. **Background Processing:** Because platforms like Render kill requests over 30 seconds, FastAPI immediately returns `{ status: "processing" }` and hands the file to a background task (`BackgroundTasks` in FastAPI).
3. **Chunking:** `pdf_service.py` extracts text page-by-page. It breaks text into ~100-200 word blocks (chunks).
4. **Storage:** Chunks are saved to the Supabase `document_chunks` table, tagged with the `product_id` and `page_number`.

### Phase B: Diagnostics (When a User Asks a Question)
1. **Query:** User types: *"My EV charger has a red flashing ring."* Request hits `assistant.py`.
2. **Retrieval (MOSS):** `moss_service.py` pulls all chunks for the specific `product_id`. It filters out common English "stop words" (*the, and, is*) from the user's query, and scores chunks based on keyword frequency. It returns the top 3-5 most relevant chunks (e.g., the page about LED fault codes). Time taken: ~10ms.
3. **Prompt Engineering:** `assistant_service.py` builds a system prompt containing:
   - The user's query.
   - The exact text of the top 3-5 chunks.
   - Strict instructions: *"You are Mantis. Follow a 6-step diagnostic flow. If you know the answer, cite the page number. If the question is about coding/math/unrelated topics, answer it but mark it with a ⚠️ and a 0% relevance score."*
4. **Inference:** Gemini processes the prompt and returns a structured JSON response containing the answer, relevance score, step number, and citations.
5. **UI Update:** Frontend parses the JSON and updates the chat bubble and the visual progress bar.

## 💡 4. Key Technical Decisions

**1. Why use keyword/MOSS retrieval instead of Vector Embeddings (like Pinecone)?**
*Answer:* "For product manuals, specific error codes (e.g., 'Error E18') or part numbers need exact lexical matching. Vector embeddings often abstract away these exact part numbers based on semantic meaning, leading to hallucinations. MOSS guarantees we find the exact string the manufacturer wrote."

**2. How do you prevent hallucinations?**
*Answer:* "We strictly bound the LLM's context. In our `assistant_service.py` system prompt, we force the LLM to only base its answers on the chunks provided by MOSS. If the context isn't in the chunks, the LLM is instructed to ask a clarifying question rather than making up a fix."

**3. How do you handle long PDF uploads without the server crashing?**
*Answer:* "We realized early on that 100-page PDFs take time to parse. Standard HTTP requests on platforms like Render timeout after 30 seconds. We implemented FastAPI `BackgroundTasks` to immediately return a 200 OK to the frontend while the Python `pdf_service.py` crunches the document asynchronously."

**4. How does the Multimodal (Image) feature work?**
*Answer:* "When a user uploads a photo of a broken part, we convert it to base64 on the frontend and hit our `/api/image/analyze` endpoint. We use GPT-4o's vision capabilities. We pass the image alongside the product context, asking the AI to identify what part is broken based on the manufacturer's descriptions."

## ⚠️ 5. Potential Pitfalls / Live Demo Guidance
- **Uploading massive PDFs live:** Unless you are prepared to wait 20-30 seconds, use the pre-seeded "Industrial Motor", "EV Charger", and "Smart Thermostat" products we injected directly into the DB. They are already fully indexed.
- **Rapid-fire Voice API calls:** ElevenLabs has a strict free-tier limit. Keep voice demonstrations concise to avoid hitting a `429 Too Many Requests` error.

---

## 🚀 Setup and Installation Instructions

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
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

## 💻 Detailed Usage Guide

Mantis is designed with two distinct interfaces: the **B2B Company Dashboard** for knowledge ingestion, and the **Consumer Diagnostic Assistant** for end-user troubleshooting.

### 🏭 For Manufacturers (B2B Workflow)
1. **Login & Dashboard Access:** Navigate to the company login portal and access your dedicated dashboard.
2. **Register a Product:** Click "Add New Product" to create a profile. You will need to provide the product name, model number, and a brief description.
3. **Upload Knowledge Base:** 
   - Navigate to the "Knowledge" tab for your newly created product.
   - Drag and drop heavy PDF service manuals (100+ pages supported) directly into the uploader.
   - Mantis's backend immediately begins a background task to chunk, classify, and index the document. You can monitor the "Ready/Indexing" status live without your browser freezing.
4. **Add Multimedia Links:** Optionally, paste YouTube URLs containing teardowns or visual repair guides to enrich the knowledge base.

### 🛠️ For End-Users / Technicians (Diagnostic Workflow)
1. **Select the Product:** From the main catalog, search for or click on the product you are repairing (e.g., *Industrial Motor X200*).
2. **Initiate the Session:** You are greeted by the AI Technician interface. You can interact in three ways:
   - **Text:** Type out your symptoms (e.g., "The motor is overheating and flashing a red LED").
   - **Voice (Hands-Free):** Click the microphone icon to speak. Mantis will transcribe your speech via the Web Speech API and reply using ElevenLabs text-to-speech — perfect when your hands are dirty or full.
   - **Image Upload:** Click the camera icon to upload a photo of a broken wire, burned circuit board, or cryptic error code display. GPT-4o Vision will analyze the image against the manual.
3. **The 6-Step Guided Flow:** Do not expect a wall of text. Mantis will methodically guide you:
   - **Step 1 (Intake):** It will acknowledge your problem.
   - **Step 2 (Hypothesis):** It formulates possible causes internally based on exact manual citations.
   - **Step 3 (Elimination):** It will ask you 1-2 focused, yes/no questions to narrow down the fault.
   - **Step 4 (Inspection):** It will instruct you on a safe test to perform (e.g., "Check resistance on pins 3 and 4").
   - **Step 5 (Narrowing):** It eliminates false leads based on your inspection results.
   - **Step 6 (Resolution):** It provides the precise, numbered fix along with the exact page number from the service manual so you can verify it.


