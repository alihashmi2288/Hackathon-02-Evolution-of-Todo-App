# Claude Code Rules

 Rules: @AGENTS.md

# Todo App - Hackathon II
 
## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development.
 
## Spec-Kit Structure
Specifications are organized in `/specs` using a folder-per-feature pattern:
- `/specs/<ID>-<feature-name>/spec.md` - Requirements (WHAT)
- `/specs/<ID>-<feature-name>/plan.md` - Architecture (HOW)
- `/specs/<ID>-<feature-name>/tasks.md` - Implementation (STEPS)

## How to Use Specs
1. Always read relevant folder before implementing (spec -> plan -> tasks)
2. Every code change MUST reference a Task ID from the tasks.md file
3. Update specific feature files if requirements change; do not create global split files
 
## Project Structure
- `/frontend` - Next.js 14+ app (see `frontend/CLAUDE.md` for details)
- `/backend` - Python FastAPI server (see `backend/CLAUDE.md` for details)
- `/specs` - Feature specifications (spec-driven development)
- `/history` - PHRs and ADRs

## Component Documentation
Each component has its own CLAUDE.md with specific instructions:
- **Frontend**: `frontend/CLAUDE.md` - Next.js setup, auth flow, component guidelines
- **Backend**: `backend/CLAUDE.md` - FastAPI setup, layer responsibilities, API design

## Development Workflow
1. Read spec/plan/tasks: `specs/[ID]-[feature]/`
2. Implement backend: Follow `backend/CLAUDE.md`
3. Implement frontend: Follow `frontend/CLAUDE.md`
4. Test and iterate
 
## Commands
- Frontend: cd frontend && npm run dev
- Backend: cd backend && uvicorn main:app --reload
- Both: docker-compose up

## Active Technologies
- Python 3.10+ (Backend), TypeScript 5.x (Frontend) + FastAPI 0.100+, Next.js 16.0.10, SQLModel, Better Auth (001-project-init-architecture)
- Neon Serverless PostgreSQL (001-project-init-architecture)
- TypeScript 5.x (Frontend), Python 3.12 (Backend) + Better Auth + JWT plugin (Frontend), python-jose (Backend) (002-auth-identity)
- Neon Serverless PostgreSQL (user, session, account tables) (002-auth-identity)
- Python 3.12 (Backend), TypeScript 5.x (Frontend - future) + FastAPI 0.100+, SQLModel, python-jose (JWT validation) (003-todo-crud)
- Neon Serverless PostgreSQL via SQLModel ORM (003-todo-crud)
- TypeScript 5.6+, Next.js 16.0.10 (App Router) + React 19.x, Tailwind CSS 3.4+, Better Auth (JWT) (004-frontend-todo-ui)
- N/A (backend handles persistence via SPEC-003) (004-frontend-todo-ui)
- Python 3.12 (Backend), TypeScript 5.6+ (Frontend) + FastAPI 0.100+, SQLModel, Next.js 16.0.10, React 19.x, Tailwind CSS 3.4+, Better Auth (005-todo-enhancements)
- Neon Serverless PostgreSQL (new tables: todo_occurrences, reminders, notifications, push_subscriptions, user_preferences) (006-recurring-reminders)
- Python 3.12 (Backend), TypeScript 5.6+ (Frontend) + FastAPI 0.100+, openai-agents SDK, SQLModel, Next.js 16.0.10, React 19.x (007-ai-todo-chatbot)
- Neon Serverless PostgreSQL (conversations, messages, todos tables) (007-ai-todo-chatbot)

## Recent Changes
- 001-project-init-architecture: Added Python 3.10+ (Backend), TypeScript 5.x (Frontend) + FastAPI 0.100+, Next.js 16.0.10, SQLModel, Better Auth
