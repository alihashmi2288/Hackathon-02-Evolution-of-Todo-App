# Todo AI Chatbot (Phase 3)

A full-stack intelligent Todo application featuring a conversational AI assistant powered by **Google Gemini 2.5 Flash**. The chatbot can manage tasks (add, list, update, complete, delete) using natural language through a **Model Context Protocol (MCP)** server integration.

## 🚀 Features

*   **Conversational AI**: Chat naturally with your Todo list using Google's Gemini 2.5 Flash model.
*   **Intelligent Agent**: The AI understands context and executes tools via an internal MCP server.
*   **Tool Usage**:
    *   Add Tasks (with automatic user scoping)
    *   List Tasks (filtering by status)
    *   Update Tasks (rename, change description)
    *   Complete/Delete Tasks
*   **Modern Frontend**: Next.js 16 (App Router) with Tailwind CSS and a custom Chat Interface.
*   **Robust Backend**: FastAPI with SQLModel, PostgreSQL (Neon), and an integrated MCP server.
*   **User Experience**: Automatic user context injection (no need to specify user IDs).

## 🛠️ Tech Stack

### Backend (`/backend`)
*   **Framework**: FastAPI
*   **Language**: Python 3.12+
*   **Database**: PostgreSQL (Neon Serverless) via SQLModel (SQLAlchemy)
*   **AI Model**: Google Gemini 2.5 Flash
*   **Agent Framework**: `openai-agents` (with custom `FunctionTool` wrappers)
*   **Tooling Protocol**: Model Context Protocol (MCP) via `fastmcp`
*   **Auth**: JWT Verification (Better Auth compatible)

### Frontend (`/frontend`)
*   **Framework**: Next.js 16.0.10 (App Router)
*   **Language**: TypeScript 5.6+
*   **UI Library**: React 19, Tailwind CSS
*   **Components**: Custom Chat Interface and standard Todo UI components
*   **Auth**: Better Auth Client

## 📦 Setup Instructions

### Prerequisites
*   Python 3.12+
*   Node.js 18+
*   PostgreSQL Database (Neon or Local)
*   Google Gemini API Key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env to add DATABASE_URL and GEMINI_API_KEY
```

**Run the Backend:**
```bash
# Start FastAPI + MCP Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend runs on `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Ensure NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the Frontend:**
```bash
npm run dev
```
The frontend runs on `http://localhost:3000`.

## 🧠 Architecture Highlights

*   **Agent Integration**: The `Todo Agent` is defined in `backend/app/agent.py`. It wraps standard Python functions as MCP tools.
*   **Tool Compatibility**: We implement a custom `function_tool` wrapper to generate JSON schemas compatible with the `agents` library and Gemini's function calling API.
*   **Scoped Execution**: In `backend/app/routers/chat.py`, we create per-request agents that inject the authenticated `user_id` into tool calls automatically, providing a seamless UX.

## 🧪 Testing

```bash
# Backend Tests
cd backend
pytest

# API Verification (curl)
curl -X POST "http://localhost:8000/api/test-user/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Add a task to buy milk"}'
```
