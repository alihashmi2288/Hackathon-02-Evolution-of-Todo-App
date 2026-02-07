# Implementation Plan: Local Kubernetes Deployment

**Branch**: `008-k8s-deployment` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-k8s-deployment/spec.md`

## Summary

Deploy the AI Todo Chatbot (Next.js frontend + FastAPI backend) to a local Minikube cluster using Helm Charts. The implementation involves analyzing existing Docker/Helm artifacts, fixing compliance issues (multi-stage builds, health probes, imagePullPolicy), and producing production-ready deployment configurations.

## Technical Context

**Language/Version**: Python 3.12 (backend), Node.js 18 / TypeScript 5.6+ (frontend)
**Primary Dependencies**: FastAPI, Next.js 16.0.10, Helm v3, Minikube, Docker Desktop
**Storage**: Neon Serverless PostgreSQL (external, not containerized)
**Testing**: Manual validation via Helm install + chatbot CRUD operations
**Target Platform**: Local Kubernetes (Minikube with Docker Desktop driver)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Pods ready within 2 minutes, frontend accessible within 30 seconds
**Constraints**: Images < 500MB (frontend), < 300MB (backend); stateless services; no hardcoded secrets
**Scale/Scope**: Local development; 1-3 replicas per service

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | ✅ PASS | Spec exists at `specs/008-k8s-deployment/spec.md` |
| II. Agentic Dev Stack Enforcement | ✅ PASS | Following spec → plan → tasks workflow |
| III. Correction Over Preservation | ✅ PASS | Spec authorizes rewriting non-compliant artifacts |
| IV. Stateless by Design | ✅ PASS | FR-016/017/018/019 enforce stateless services |
| V. MCP-First AI Integration | N/A | No AI agent changes in this feature |
| VI. Tool Determinism | N/A | No MCP tool changes in this feature |
| VII. Authentication & Identity | N/A | Auth unchanged; handled by existing JWT flow |
| VIII. Security by Default | ✅ PASS | FR-015 prohibits secrets in version control |
| IX. API Contract Stability | N/A | No API changes in this feature |
| X. Observability & Debuggability | ✅ PASS | FR-023/024 require liveness/readiness probes |
| XI. Simplicity & YAGNI | ✅ PASS | Single chart structure per clarification |
| XII. AI Provider Independence | N/A | No AI provider changes in this feature |

**GATE RESULT**: ✅ PASS — No violations detected.

## Existing Artifacts Analysis

### Dockerfiles

| Artifact | Location | Status | Issues |
|----------|----------|--------|--------|
| Frontend Dockerfile | `frontend/Dockerfile` | ⚠️ PARTIAL | ✅ Multi-stage build, ⚠️ Uses node:18 (acceptable) |
| Backend Dockerfile | `backend/Dockerfile` | ❌ NON-COMPLIANT | ❌ Single-stage build, ❌ Includes build-essential in production, ❌ Uses requirements.txt (missing) |

### Helm Charts

| Artifact | Location | Status | Issues |
|----------|----------|--------|--------|
| Chart.yaml | `charts/todo-app/Chart.yaml` | ✅ OK | Valid structure |
| values.yaml | `charts/todo-app/values.yaml` | ⚠️ PARTIAL | ❌ imagePullPolicy: IfNotPresent (should be Never), ❌ No resource limits defined, ❌ Uses LoadBalancer (should be NodePort for Minikube) |
| backend-deployment.yaml | `charts/todo-app/templates/` | ⚠️ PARTIAL | ❌ No liveness/readiness probes |
| frontend-deployment.yaml | `charts/todo-app/templates/` | ⚠️ PARTIAL | ❌ No liveness/readiness probes |

### Health Endpoints

| Service | Liveness Endpoint | Readiness Endpoint | Status |
|---------|-------------------|-------------------|--------|
| Backend | `/health` | `/health/ready` | ✅ EXISTS |
| Frontend | `/` | `/` | ⚠️ USE ROOT (Next.js default) |

## Remediation Plan

### Phase 1: Fix Backend Dockerfile
1. Convert to multi-stage build
2. Remove build-essential from production stage
3. Create requirements.txt from pyproject.toml dependencies
4. Target image size: < 300MB

### Phase 2: Update Helm values.yaml
1. Set `imagePullPolicy: Never`
2. Change frontend service type from LoadBalancer to NodePort
3. Add resource requests and limits

### Phase 3: Add Health Probes to Deployments
1. Backend: liveness → `/health`, readiness → `/health/ready`
2. Frontend: liveness → `/`, readiness → `/`

### Phase 4: Rename Chart Directory
1. Rename `charts/todo-app` to `charts/todo` per spec deliverables

## Project Structure

### Documentation (this feature)

```text
specs/008-k8s-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no new data models)
├── quickstart.md        # Phase 1 output (deployment instructions)
├── contracts/           # Phase 1 output (N/A - no API contracts)
├── analysis.md          # Existing artifact analysis
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── Dockerfile           # Multi-stage build (TO FIX)
├── requirements.txt     # Dependencies (TO CREATE)
└── app/
    └── routers/
        └── health.py    # Health endpoints (EXISTS)

frontend/
├── Dockerfile           # Multi-stage build (EXISTS - OK)
└── src/
    └── app/
        └── page.tsx     # Root for health check

charts/
└── todo/                # Helm chart (RENAME from todo-app)
    ├── Chart.yaml
    ├── values.yaml      # Configuration (TO FIX)
    └── templates/
        ├── backend-deployment.yaml   # (TO FIX - add probes)
        ├── backend-service.yaml
        ├── frontend-deployment.yaml  # (TO FIX - add probes)
        ├── frontend-service.yaml
        └── secrets.yaml
```

**Structure Decision**: Web application structure with existing `backend/` and `frontend/` directories. Helm chart in `charts/todo/` with single-chart structure (all templates in one chart, no subcharts).

## Complexity Tracking

No violations to justify — all requirements follow standard Kubernetes patterns.

---

## Phase 0: Research

### Research Tasks

1. **Backend Dockerfile multi-stage pattern for FastAPI** — Best practices for Python slim images
2. **Minikube image loading strategy** — Confirmed: `eval $(minikube docker-env)`
3. **Helm probe configuration** — Standard Kubernetes probe patterns
4. **Next.js standalone output** — Required for Docker deployment (already configured)

### Research Findings

See [research.md](./research.md) for detailed findings.

---

## Phase 1: Design

### No New Data Models
This feature does not introduce new data models — it deploys existing application code.

### No New API Contracts
This feature does not introduce new API endpoints — it deploys existing APIs.

### Deployment Configuration Contracts

See [quickstart.md](./quickstart.md) for:
- Prerequisites checklist
- Step-by-step deployment instructions
- Validation commands
- Troubleshooting guide

---

## Implementation Tasks (High-Level)

| ID | Task | Priority | Dependencies |
|----|------|----------|--------------|
| T1 | Create requirements.txt for backend | P1 | None |
| T2 | Rewrite backend Dockerfile (multi-stage) | P1 | T1 |
| T3 | Rename charts/todo-app → charts/todo | P1 | None |
| T4 | Update values.yaml (imagePullPolicy, NodePort, resources) | P1 | T3 |
| T5 | Add health probes to backend-deployment.yaml | P1 | T3 |
| T6 | Add health probes to frontend-deployment.yaml | P1 | T3 |
| T7 | Create .dockerignore files | P2 | None |
| T8 | Update README with deployment instructions | P2 | T1-T6 |
| T9 | Create analysis.md documenting remediation | P2 | T1-T6 |
| T10 | Validate deployment end-to-end | P1 | T1-T6 |

---

## Validation Checklist

- [ ] `minikube start` succeeds
- [ ] `eval $(minikube docker-env)` sets Docker context
- [ ] `docker build -t todo-backend ./backend` succeeds, image < 300MB
- [ ] `docker build -t todo-frontend ./frontend` succeeds, image < 500MB
- [ ] `helm install todo ./charts/todo` succeeds
- [ ] All pods reach Running state within 2 minutes
- [ ] Frontend accessible via `minikube service todo-frontend --url`
- [ ] Chatbot CRUD operations work (create, list, update, delete tasks)
- [ ] `kubectl delete pod -l app=todo-backend` → pod restarts, data intact
- [ ] Scaling to 3 replicas succeeds

---

## Next Steps

Run `/sp.tasks` to generate detailed implementation tasks from this plan.
