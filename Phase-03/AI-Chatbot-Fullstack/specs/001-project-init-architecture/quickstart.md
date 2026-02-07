# Quickstart Guide: Todo Full-Stack Application

**Feature Branch**: `001-project-init-architecture`
**Date**: 2026-01-15

## Overview

This guide helps developers set up and run the Todo Full-Stack application locally. Target time: **15 minutes** from clone to running application.

---

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Node.js | 18+ | `node --version` |
| Python | 3.10+ | `python --version` |
| Git | Any | `git --version` |
| npm or pnpm | Latest | `npm --version` |

### Database Setup

You'll need a Neon PostgreSQL database:
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

---

## Step 1: Clone and Navigate

```bash
git clone <repository-url> todo-full-stack
cd todo-full-stack
```

---

## Step 2: Environment Configuration

### 2.1 Create Environment File

```bash
cp .env.example .env
```

### 2.2 Configure Required Variables

Edit `.env` with your values:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Authentication (Required)
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Frontend (Required)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure secret:**
```bash
# macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (when available)
# alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Verify:** Open http://localhost:8000/health in browser

---

## Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install
# or: pnpm install

# Start development server
npm run dev
# or: pnpm dev
```

**Expected output:**
```
  ▲ Next.js 16.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

**Verify:** Open http://localhost:3000 in browser

---

## Step 5: Verify Setup

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### Readiness Check

```bash
curl http://localhost:8000/health/ready
```

Expected response:
```json
{
  "status": "ready",
  "timestamp": "2026-01-15T10:30:00Z",
  "checks": {
    "database": "connected",
    "config": "valid"
  }
}
```

---

## Project Structure

```
todo-full-stack/
├── frontend/                  # Next.js 16.0.10 application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Auth, utilities
│   │   └── services/         # API client
│   └── package.json
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py           # Entry point
│   │   ├── config.py         # Settings
│   │   ├── database.py       # DB connection
│   │   ├── models/           # SQLModel models
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   └── schemas/          # Pydantic schemas
│   └── requirements.txt
│
├── specs/                     # Specifications
│   └── <ID>-<feature>/
│       ├── spec.md           # Requirements
│       ├── plan.md           # Architecture
│       └── tasks.md          # Implementation
│
├── history/                   # Development history
│   ├── prompts/              # PHRs
│   └── adr/                  # ADRs
│
├── .env.example              # Environment template
├── CLAUDE.md                 # AI instructions
└── AGENTS.md                 # Agent behaviors
```

---

## Development Workflow

### 1. Before Writing Code

```bash
# Read the spec for your feature
cat specs/<ID>-<feature>/spec.md
cat specs/<ID>-<feature>/plan.md
cat specs/<ID>-<feature>/tasks.md
```

### 2. Reference Task IDs

All commits must reference task IDs:
```bash
git commit -m "feat: Add todo creation [TASK-002-001]"
```

### 3. Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## Common Issues

### Missing Environment Variable

**Error:**
```
Configuration error: DATABASE_URL is required
```

**Solution:** Ensure `.env` file exists and contains all required variables.

### Database Connection Failed

**Error:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check Neon dashboard for connection status
3. Ensure `?sslmode=require` is in the connection string

### Port Already in Use

**Error:**
```
ERROR: [Errno 48] Address already in use
```

**Solution:**
```bash
# Find and kill process on port
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Python Version Mismatch

**Error:**
```
SyntaxError: invalid syntax (Python < 3.10)
```

**Solution:** Install Python 3.10+ and recreate virtual environment.

---

## Next Steps

1. **Read the Constitution**: `.specify/memory/constitution.md`
2. **Explore Specs**: Check existing specifications in `/specs`
3. **Use Spec-Kit Commands**: `/sp.specify`, `/sp.plan`, `/sp.tasks`
4. **Review AGENTS.md**: Understand agent responsibilities

---

## Useful Commands

| Task | Frontend | Backend |
|------|----------|---------|
| Start dev server | `npm run dev` | `uvicorn app.main:app --reload` |
| Run tests | `npm test` | `pytest` |
| Type check | `npm run typecheck` | `mypy app/` |
| Lint | `npm run lint` | `ruff check app/` |
| Format | `npm run format` | `ruff format app/` |
| Build | `npm run build` | N/A |

---

## Support

- Check existing specs and PHRs for context
- Review CLAUDE.md for AI assistant conventions
- Consult AGENTS.md for development guidelines
