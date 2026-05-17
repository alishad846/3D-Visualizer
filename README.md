# ScanVista 🔍🚀
### AI-Powered QR to 3D Product Visualizer

> [!NOTE]
> **ScanVista** is a futuristic, interactive web ecosystem that transforms static QR codes into immersive digital sandboxes. By scanning a product QR, users instantly view a photorealistic 3D rendering (WebGL), interact with it spatially in Augmented Reality (AR), and speak naturally with a context-aware AI Voice Assistant.

---

## 🎨 Design Philosophy & Features

ScanVista is built to showcase a premium consumer onboarding experience:
*   **Vibrant Glassmorphic UI**: Translucent visual cards, deep base gradients, Outfit/Jakarta sans-serif custom typography, and dynamic micro-animations.
*   **Rotatable 3D Engine**: Interactive component mesh loading with component-level raycasting highlights and exploded viewpoint physics.
*   **Voice Q&A Assistant**: Intelligent audio transcription and narration processing. Speak directly to query pricing, specifications, and instructions.
*   **PGVector Recommendation Carousel**: Vector embedding comparisons to suggest matched items inside the visual deck.
*   **Real-time Analytics Dashboard**: Tracks scanners, device profiles, AR engagement, and session duration.

---

## 📦 Directory Topography

```
scanvista/
├── client/                          # React + Vite (Port 3000)
│   ├── src/
│   │   ├── api/                     # Modular service APIs
│   │   ├── components/              # 3D, AR, Voice, QR, and UI elements
│   │   ├── pages/                   # Auth, Dashboards, and Public Viewers
│   │   ├── store/                   # Zustand state managers
│   │   └── styles/                  # globals.css (Modern dark tokens)
│   
├── server/                          # Node.js + Express (Port 5000)
│   ├── src/
│   │   ├── controllers/             # Express endpoint logic
│   │   ├── db/                      # PostgreSQL pg-pool client
│   │   ├── middleware/              # JWT verification, upload limits, rate limiters
│   │   ├── routes/                  # Express routing blocks
│   │   └── services/                # Supabase Storage, QR, and flusher workers
│   
├── ai-service/                      # Python + FastAPI (Port 8000)
│   ├── app/
│   │   ├── routers/                 # AI routers (Q&A, generator fallbacks)
│   │   └── engines/                 # GPT-4 / HuggingFace text-to-speech
│   
└── docs/                            # Unified Specifications
    ├── PRD.md                       # Comprehensive Product Requirements
    └── DB_SCHEMA.md                 # Detailed Relational Schema spec
```

---

## 🚀 Workspace Setup & Quickstart

We have set up a **monorepo-style workspace** at the root of `scanvista`. You can manage, install dependencies for, and launch all three services concurrently from the root directory.

### Prerequisites
Make sure you have the following installed on your system:
*   **Node.js** (v18 or higher)
*   **Python** (3.9 or higher)
*   **Docker** (Optional, for running with database engines)

---

### Step 1: Install Dependencies
To install all dependencies for both the React Client and Node API server in one shot, run the following command from the project root:
```bash
npm run install:all
```

For the AI service, navigate and install python packages:
```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

---

### Step 2: Set Up Environment Variables
Ensure the `.env` configurations are populated for local development. Standard samples are pre-built for you in:
*   **[`client/.env`](file:///c:/Users/hp/Desktop/scanvista/client/.env)**: Port maps & backend addresses.
*   **[`server/.env`](file:///c:/Users/hp/Desktop/scanvista/server/.env)**: Database connections & Supabase key sets.
*   **[`ai-service/.env`](file:///c:/Users/hp/Desktop/scanvista/ai-service/.env)**: FastAPI config parameters.

---

### Step 3: Run the Complete Ecosystem

To boot up the React client, Express API server, and FastAPI Python server simultaneously in dev-reload mode, run this single command in the project root:
```bash
npm run dev
```

> [!TIP]
> The concurrent logger uses color-coded tag prefixes (`[client]`, `[server]`, `[ai-service]`) so you can easily trace the logs from all three active environments in a single terminal.

---

## 🐳 Running with Docker Compose

If you have Docker installed and want to run the full stack (including live PostgreSQL database and Redis caching engines), simply run:
```bash
docker-compose up --build
```
This orchestrates the following networks:
*   **React App**: `http://localhost:3000`
*   **Express API**: `http://localhost:5000`
*   **FastAPI Service**: `http://localhost:8000`
*   **Postgres DB**: `localhost:5432`
*   **Redis Engine**: `localhost:6379`

---

## 📝 Project Scripts Reference

| Script Command | Scope | Description |
| :--- | :--- | :--- |
| `npm run install:all` | Monorepo | Installs npm dependencies inside `client/` and `server/` folders. |
| `npm run dev` | Monorepo | Concurrently launches React client, Node.js API, and Python AI service. |
| `npm run dev:client` | Client | Runs only the React + Vite dev server. |
| `npm run dev:server` | Server | Runs only the Express API with `nodemon` dev watching. |
| `npm run dev:ai` | AI Service | Runs only the FastAPI server in dev reload mode. |
| `npm run start` | Monorepo | Launches production builds concurrently. |