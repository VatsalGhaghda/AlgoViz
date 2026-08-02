<div align="center">

# AlgoViz

### Interactive Algorithm & Data Structure Visualization Platform

An educational web app that lets you step through algorithms with smooth animations,
and visualize your own Python code execution — line by line, variable by variable.

**Developed by Vatsal Ghaghda**

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=flat-square&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=flat-square&logo=nodedotjs)](https://expressjs.com)
[![Execution](https://img.shields.io/badge/Execution-Python%20%2B%20FastAPI-yellow?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Local Development Setup](#local-development-setup)
5. [Environment Variables](#environment-variables)
6. [Uploading to GitHub](#uploading-to-github)
7. [Deploying the Frontend (Vercel)](#deploying-the-frontend-vercel)
8. [Deploying the Backend (Render)](#deploying-the-backend-render)
9. [Deploying the Execution Service (Render)](#deploying-the-execution-service-render)
10. [Post-Deployment Configuration](#post-deployment-configuration)
11. [API Reference](#api-reference)

---

## Features

### DSA Visualizer (`/learn`)
- **43+ operations** across 6 data structure categories:
  - **Sorting**: Bubble, Quick, Merge, Insertion, Selection Sort
  - **Searching**: Linear Search, Binary Search
  - **Graph Traversals**: BFS, DFS
  - **Arrays**: Create, Traverse, Insert, Delete, Update, Reverse, Find Min/Max, Access
  - **Linked Lists**: Create, Traverse, Search, Insert/Delete at beginning, end, and position
  - **Stacks & Queues**: Push, Pop, Peek, Enqueue, Dequeue, Front, Rear
- Smooth **Framer Motion** animations with `layoutId` for seamless state transitions
- **Playback controls**: Play, Pause, Step Forward/Backward, Restart, Speed control
- Synchronized **code panel** with auto-scrolling and **variables panel**

### Python Code Visualizer (`/python`)
- **Monaco Editor** with custom dark theme (`algovis-dark`)
- Step through **any Python code** you write — line by line
- **6 curated example snippets**: Factorial, Fibonacci, Bubble Sort, Binary Search, Linked List, Stack
- Real-time panels:
  - **Variables** (local & global scope)
  - **Call Stack** (live frame push/pop)
  - **Console Output** (`print()` output attributed per step)
  - **Memory View** (typed boxes for primitives, sequences, dicts, sets)
- **Error visualization**: red squiggle in editor + slide-in error banner
- Keyboard shortcut: `Ctrl+Enter` / `Cmd+Enter` to run

---

## Project Structure

```
AlgoVisualizer/
├── frontend/                   # React + Vite SPA (deployed to Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # TopNav, Sidebar, Footer, AppShell
│   │   │   └── viz/            # Canvas, Panel, and Editor components
│   │   ├── pages/              # LandingPage, AboutPage, WorkspacePage, PythonWorkspacePage, etc.
│   │   ├── hooks/              # usePlayback, useExecution, useTheme
│   │   ├── lib/
│   │   │   ├── algorithms/     # 43+ step generators
│   │   │   └── api/            # executeCode() API client
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── backend/                    # Node.js + Express API gateway (deployed to Render)
│   ├── src/
│   │   ├── app.ts              # Express setup, CORS, routes
│   │   ├── server.ts           # HTTP server entry point
│   │   ├── routes/             # execution.route.ts
│   │   ├── controllers/        # execution.controller.ts (validation + proxy)
│   │   └── types/              # TypeScript type mirrors
│   └── package.json
│
├── execution-service/          # Python FastAPI sandbox (deployed to Render)
│   ├── app/
│   │   ├── main.py             # FastAPI app, /execute endpoint
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── exceptions.py       # ExecutionTimeout
│   │   ├── parser/             # AST syntax validation
│   │   ├── executor/           # runner.py — compile → track → execute
│   │   ├── trackers/           # line, variable, call_stack, output trackers
│   │   └── sandbox/            # InProcessSandbox with restricted builtins
│   ├── tests/                  # 237 pytest tests
│   └── requirements.txt
│
├── shared/                     # Shared TypeScript types
│   ├── types/execution.ts
│   └── event-schema/trace-event.ts
│
├── docker-compose.yml          # Local full-stack orchestration
└── .env.example                # Environment variable template
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, TypeScript |
| Styling | Tailwind CSS v4 (oklch design tokens) |
| Animations | Framer Motion |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Icons | Lucide React |
| Backend | Node.js, Express.js, TypeScript |
| Execution | Python 3.12+, FastAPI, Uvicorn |
| Validation | Pydantic v2 |
| Containerization | Docker + docker-compose |

---

## Local Development Setup

### Prerequisites

Make sure you have the following installed:
- **Node.js** 20+ — https://nodejs.org
- **Python** 3.12+ — https://python.org
- **Git** — https://git-scm.com

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AlgoVisualizer.git
cd AlgoVisualizer
```

### Step 2 — Set up the Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Step 3 — Set up the Backend

Open a new terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
PORT=5000
EXECUTION_SERVICE_URL=http://localhost:8000
```

Then start the backend:
```bash
npm run dev
```
Backend API runs at: **http://localhost:5000**

### Step 4 — Set up the Execution Service

Open another terminal:

```bash
cd execution-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Execution service runs at: **http://localhost:8000**

### Verify Everything Works

Open http://localhost:5173/python, type any Python code, and click **Run**.
You should see steps appear in the timeline. If you see steps, all 3 services are wired correctly.

### Optional — Run the Full Stack with Docker

```bash
docker-compose up --build
```

> Note: The docker-compose setup is primarily for reference. For development, running each service separately (Steps 2–4) is recommended.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

> In production (Vercel), set `VITE_API_URL` to your Render backend URL.

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `EXECUTION_SERVICE_URL` | Internal URL of the Python service | `http://localhost:8000` |
| `CORS_ORIGIN` | Allowed frontend origin for CORS | `https://your-app.vercel.app` |

### Execution Service — no `.env` required
The execution service reads optional environment variables directly:

| Variable | Description | Default |
|---|---|---|
| `SANDBOX_TIMEOUT_SECONDS` | Max seconds a user script can run | `5` |
| `SANDBOX_MAX_MEMORY_MB` | Max memory limit (Docker only) | `128` |

---

## Uploading to GitHub

### Step 1 — Create a new GitHub repository

1. Go to https://github.com/new
2. Set the repository name to `AlgoVisualizer` (or any name you prefer)
3. Keep it **Public** or **Private** — your choice
4. **Do NOT** initialize with a README, .gitignore, or license (the project already has these)
5. Click **Create repository**

### Step 2 — Initialize Git and push

Open a terminal in the `AlgoVisualizer` root folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit — AlgoViz v0.1"

# Connect to your GitHub repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

> If you are prompted for credentials, use your GitHub username and a **Personal Access Token** (not your password).
> Create one at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)

### Step 3 — Verify

Visit `https://github.com/YOUR_USERNAME/AlgoVisualizer` — you should see all your files uploaded.

---

## Deploying the Frontend (Vercel)

Vercel is the easiest platform for deploying React/Vite apps. Deploy takes ~2 minutes.

### Step 1 — Sign up / Log in

Go to https://vercel.com and sign in with your GitHub account.

### Step 2 — Import the project

1. Click **"Add New"** → **"Project"**
2. Select your `AlgoVisualizer` GitHub repository
3. Vercel will detect it is a Vite project automatically

### Step 3 — Configure build settings

Set the following in the Vercel project configuration:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 4 — Add environment variables

In the **Environment Variables** section, add:

| Name | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://algoviz-backend.onrender.com`) |

> You can add this after deploying the backend — just redeploy the frontend once you have the URL.

### Step 5 — Deploy

Click **Deploy**. Vercel will build and publish your frontend in ~2 minutes.

Your frontend will be live at a URL like: `https://algoviz-xyz.vercel.app`

### Step 6 — Configure SPA routing (if needed)

If you get 404 errors when refreshing non-root pages, create a `frontend/public/vercel.json` file:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Then commit and push — Vercel will redeploy automatically.

---

## Deploying the Backend (Render)

### Step 1 — Sign up / Log in

Go to https://render.com and sign in with your GitHub account.

### Step 2 — Create a new Web Service

1. Click **"New"** → **"Web Service"**
2. Connect your `AlgoVisualizer` GitHub repository
3. Click **Connect**

### Step 3 — Configure the service

| Setting | Value |
|---|---|
| **Name** | `algoviz-backend` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (for testing) or Starter (for production) |

### Step 4 — Add environment variables

In the **Environment** tab, add:

| Key | Value |
|---|---|
| `PORT` | `5000` |
| `EXECUTION_SERVICE_URL` | Your Render execution service URL (e.g. `https://algoviz-execution.onrender.com`) |
| `CORS_ORIGIN` | Your Vercel frontend URL (e.g. `https://algoviz.vercel.app`) |

> Add `EXECUTION_SERVICE_URL` after deploying the execution service.

### Step 5 — Deploy

Click **Create Web Service**. Render will build and deploy your backend.

Your backend will be live at: `https://algoviz-backend.onrender.com`

Test it by visiting: `https://algoviz-backend.onrender.com/api/health`
You should see: `{"status":"success","message":"Backend is healthy"}`

---

## Deploying the Execution Service (Render)

The execution service is a Python/FastAPI app deployed as a separate Render service.

### Step 1 — Create another Web Service

1. In Render, click **"New"** → **"Web Service"**
2. Connect the same `AlgoVisualizer` repository
3. Click **Connect**

### Step 2 — Configure the service

| Setting | Value |
|---|---|
| **Name** | `algoviz-execution` |
| **Root Directory** | `execution-service` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free (for testing) or Starter (for production) |

### Step 3 — Add environment variables

| Key | Value |
|---|---|
| `SANDBOX_TIMEOUT_SECONDS` | `5` |

### Step 4 — Deploy

Click **Create Web Service**. Render will install Python dependencies and start the FastAPI server.

Your execution service will be live at: `https://algoviz-execution.onrender.com`

Test it by running:
```bash
curl -X POST https://algoviz-execution.onrender.com/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "x = 1 + 1\nprint(x)"}'
```
You should get back a JSON response with `steps` and `status: "completed"`.

---

## Post-Deployment Configuration

Once all three services are deployed, connect them together:

### 1. Update the Backend's `EXECUTION_SERVICE_URL`
- Go to your **algoviz-backend** service on Render
- Environment tab → update `EXECUTION_SERVICE_URL` to `https://algoviz-execution.onrender.com`
- Click **Save Changes** — Render will redeploy automatically

### 2. Update the Frontend's `VITE_API_URL`
- Go to your project on **Vercel** → Settings → Environment Variables
- Update `VITE_API_URL` to `https://algoviz-backend.onrender.com`
- Go to **Deployments** → click the three-dot menu → **Redeploy**

### 3. Update Backend CORS
- On Render, update `CORS_ORIGIN` to your actual Vercel URL
- Redeploy the backend

### 4. Final Smoke Test

1. Open your Vercel URL (e.g. `https://algoviz.vercel.app`)
2. Navigate to `/python`
3. Type `print("Hello from the cloud!")` and click **Run**
4. You should see the execution trace appear — all three services are working!

---

## API Reference

### Backend (Express) — Port 5000

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{ "status": "success", "message": "Backend is healthy" }
```

#### `POST /api/execute`
Executes Python code and returns a full execution trace.

**Request Body:**
```json
{
  "code": "x = 1\nfor i in range(3):\n    print(i)",
  "trace_limit": 1000
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | string | ✅ | Python source code (max 50KB) |
| `trace_limit` | number | ❌ | Max steps to capture (default: 1000, max: 50000) |

**Response:**
```json
{
  "steps": [
    {
      "line": 1,
      "kind": "line",
      "vars": [
        { "name": "x", "value": 1, "type": "int", "changed": true, "scope": "local" }
      ],
      "call_stack": [{ "func_name": "<module>", "line": 1 }],
      "output": "",
      "description": "Line 1 executed"
    }
  ],
  "status": "completed",
  "truncated": false
}
```

**Possible `status` values:**

| Status | Meaning |
|---|---|
| `completed` | Code ran to end successfully |
| `syntax_error` | Python syntax is invalid |
| `runtime_error` | Exception during execution |
| `timeout` | Execution exceeded time limit |
| `trace_limit_reached` | Too many steps generated |

---

## Running Tests

### Execution Service (Python)

```bash
cd execution-service
pip install -r requirements.txt
pytest
```

Expected output: **237 tests passed**

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request on GitHub

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by **Vatsal Ghaghda**

[GitHub](https://github.com/VatsalGhaghda) · [LinkedIn](https://linkedin.com/in/vatsalghaghda)

</div>
