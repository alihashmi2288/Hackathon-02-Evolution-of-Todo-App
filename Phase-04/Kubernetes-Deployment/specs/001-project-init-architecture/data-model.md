# Data Model: Project Initialization & Architecture Setup

**Feature Branch**: `001-project-init-architecture`
**Date**: 2026-01-15
**Status**: Complete

## Overview

This document defines the configuration and structural entities for the Todo Full-Stack application foundation. Since this is an architecture specification (not a feature specification), the entities describe project configuration rather than domain data.

---

## 1. Project Configuration Entity

**Purpose**: Root-level configuration defining project structure and tooling integration.

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Project name ("Todo Full-Stack") |
| `version` | string | Yes | Semantic version |
| `frontend_directory` | path | Yes | Location of Next.js app (`/frontend`) |
| `backend_directory` | path | Yes | Location of FastAPI app (`/backend`) |
| `specs_directory` | path | Yes | Location of specifications (`/specs`) |
| `history_directory` | path | Yes | Location of PHRs/ADRs (`/history`) |

### Configuration Files

```
/
├── package.json           # Monorepo scripts (optional)
├── CLAUDE.md              # AI assistant instructions
├── AGENTS.md              # Agent behaviors
└── .env.example           # Environment template
```

---

## 2. Environment Variable Entity

**Purpose**: Named configuration values organized by layer.

### Categories

#### 2.1 Database Variables

| Variable | Type | Required | Layer | Example |
|----------|------|----------|-------|---------|
| `DATABASE_URL` | connection_string | Yes | Backend | `postgresql://user:pass@host/db` |

#### 2.2 Authentication Variables

| Variable | Type | Required | Layer | Example |
|----------|------|----------|-------|---------|
| `BETTER_AUTH_SECRET` | secret | Yes | Both | 32+ character secret |
| `BETTER_AUTH_URL` | url | Yes | Both | `http://localhost:3000` |

#### 2.3 Frontend Variables

| Variable | Type | Required | Layer | Example |
|----------|------|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | url | Yes | Frontend | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` | url | Yes | Frontend | `http://localhost:3000` |

### Validation Rules

- All required variables MUST be present at startup
- `DATABASE_URL` MUST be valid PostgreSQL connection string
- `BETTER_AUTH_SECRET` MUST be minimum 32 characters
- URLs MUST be valid HTTP/HTTPS URLs
- Missing variables MUST produce actionable error messages

---

## 3. Layer Boundary Entity

**Purpose**: Logical separation defining responsibility ownership.

### Layer Definitions

#### 3.1 Frontend Layer

```yaml
name: Frontend
technology: Next.js 16.0.10 (App Router)
responsibilities:
  - User interface rendering
  - Client-side state management
  - Form validation (client-side)
  - API communication
  - Authentication UI
prohibited:
  - Direct database access
  - Business logic execution
  - Server-side data persistence
```

#### 3.2 Backend Layer

```yaml
name: Backend
technology: FastAPI 0.100+
responsibilities:
  - Business logic execution
  - Data persistence (SQLModel)
  - API endpoint exposure
  - Server-side validation
  - JWT verification
  - Database operations
prohibited:
  - UI rendering
  - Client-side state
```

#### 3.3 Authentication Layer

```yaml
name: Authentication
technology: Better Auth (JWT plugin)
responsibilities:
  frontend:
    - Session creation
    - Auth UI components
    - Token storage
  backend:
    - JWT verification
    - User ID extraction
    - Request authorization
communication:
  - JWT tokens in Authorization header
  - Stateless verification
```

### Inter-Layer Communication

```
┌─────────────┐     HTTP/REST      ┌─────────────┐
│  Frontend   │ ←─────────────────→ │   Backend   │
│  (Next.js)  │   JSON + JWT       │  (FastAPI)  │
└─────────────┘                     └─────────────┘
       │                                   │
       │ Better Auth                       │ SQLModel
       │ Client                            │
       ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Auth Server │                    │    Neon     │
│ (Next.js)   │                    │ PostgreSQL  │
└─────────────┘                    └─────────────┘
```

---

## 4. Feature Specification Entity

**Purpose**: Structured document defining requirements for a feature.

### Structure

```yaml
entity: Feature Specification
location: /specs/<ID>-<feature-name>/
files:
  - spec.md      # Requirements (WHAT)
  - plan.md      # Architecture (HOW)
  - tasks.md     # Implementation (STEPS)
  - research.md  # Technical research
  - data-model.md # Entity definitions
  - quickstart.md # Developer guide
  - contracts/   # API contracts
```

### Naming Convention

| Component | Format | Example |
|-----------|--------|---------|
| ID | 3-digit zero-padded | `001`, `042`, `100` |
| Feature Name | kebab-case | `todo-crud`, `user-auth` |
| Full Path | ID-name | `001-project-init-architecture` |

### Lifecycle States

```
Draft → Review → Approved → In Progress → Complete
```

---

## 5. Development Workflow Entity

**Purpose**: Defines the spec-driven development process.

### Workflow Steps

| Step | Command | Output | Description |
|------|---------|--------|-------------|
| 1. Specify | `/sp.specify` | `spec.md` | Define requirements |
| 2. Plan | `/sp.plan` | `plan.md`, `research.md` | Design architecture |
| 3. Taskify | `/sp.tasks` | `tasks.md` | Break into atomic tasks |
| 4. Implement | - | Source code | Write code with task refs |
| 5. Audit | `security-auditor` | Security report | Verify security |
| 6. Record | `/sp.phr` | PHR file | Document session |

### Task Reference Format

All code changes MUST include task references:

```
# In commit messages
feat: Add todo creation endpoint [TASK-001-003]

# In code comments (when clarification needed)
# Implements TASK-001-003: Create POST /todos endpoint
```

---

## Entity Relationships

```
Project Configuration
         │
         ├── Environment Variables
         │   ├── Database (Backend)
         │   ├── Auth (Shared)
         │   └── Frontend (Frontend)
         │
         ├── Layer Boundaries
         │   ├── Frontend Layer
         │   ├── Backend Layer
         │   └── Auth Layer
         │
         └── Feature Specifications
             ├── spec.md
             ├── plan.md
             └── tasks.md
```

---

## Validation Checklist

- [ ] All required environment variables documented
- [ ] Layer responsibilities clearly defined
- [ ] Inter-layer communication patterns specified
- [ ] Feature specification structure defined
- [ ] Development workflow documented
- [ ] Naming conventions established
