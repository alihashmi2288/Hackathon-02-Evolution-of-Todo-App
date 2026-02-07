# Tasks: Local Kubernetes Deployment

**Input**: Design documents from `/specs/008-k8s-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: No automated tests requested for this feature — validation is manual via deployment verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (Python/FastAPI)
- **Frontend**: `frontend/` (Next.js)
- **Helm Charts**: `charts/todo/` (renamed from charts/todo-app)
- **Specs**: `specs/008-k8s-deployment/`

---

## Phase 1: Setup (Analysis & Prerequisites)

**Purpose**: Analyze existing artifacts and document remediation plan

- [x] T001 Create analysis.md documenting existing artifact review in specs/008-k8s-deployment/analysis.md
- [x] T002 [P] Create .dockerignore for backend in backend/.dockerignore
- [x] T003 [P] Create .dockerignore for frontend in frontend/.dockerignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure changes that MUST be complete before Kubernetes deployment

**⚠️ CRITICAL**: No deployment can proceed until this phase is complete

- [x] T004 Generate requirements.txt from pyproject.toml dependencies in backend/requirements.txt
- [x] T005 Rename charts/todo-app directory to charts/todo (per spec deliverables)

**Checkpoint**: Foundation ready - Docker and Helm work can now begin

---

## Phase 3: User Story 4 - Build Docker Images (Priority: P1) 🎯 MVP Prerequisite

**Goal**: Create production-ready Docker images for both services with multi-stage builds

**Independent Test**: Run `docker build` for each service; verify images < 500MB (frontend), < 300MB (backend)

### Implementation for User Story 4

- [x] T006 [US4] Rewrite backend Dockerfile with multi-stage build in backend/Dockerfile
- [x] T007 [US4] Verify frontend Dockerfile is compliant (multi-stage exists) in frontend/Dockerfile
- [ ] T008 [US4] Build and verify backend image size (< 300MB) using `docker build -t todo-backend ./backend`
- [ ] T009 [US4] Build and verify frontend image size (< 500MB) using `docker build -t todo-frontend ./frontend`

**Checkpoint**: Both Docker images build successfully and meet size requirements

---

## Phase 4: User Story 1 - Deploy Application to Local Kubernetes (Priority: P1) 🎯 MVP

**Goal**: Deploy complete application to Minikube using single Helm command

**Independent Test**: Run `helm install todo ./charts/todo` and verify all pods reach Running state within 2 minutes

### Implementation for User Story 1

- [x] T010 [US1] Update Chart.yaml with correct chart name in charts/todo/Chart.yaml
- [x] T011 [US1] Update values.yaml with imagePullPolicy: Never in charts/todo/values.yaml
- [x] T012 [US1] Update values.yaml with NodePort for frontend service in charts/todo/values.yaml
- [x] T013 [US1] Add resource requests and limits to values.yaml in charts/todo/values.yaml
- [x] T014 [P] [US1] Add liveness probe to backend-deployment.yaml in charts/todo/templates/backend-deployment.yaml
- [x] T015 [P] [US1] Add readiness probe to backend-deployment.yaml in charts/todo/templates/backend-deployment.yaml
- [x] T016 [P] [US1] Add liveness probe to frontend-deployment.yaml in charts/todo/templates/frontend-deployment.yaml
- [x] T017 [P] [US1] Add readiness probe to frontend-deployment.yaml in charts/todo/templates/frontend-deployment.yaml
- [x] T018 [US1] Verify Helm chart syntax with `helm lint ./charts/todo`
- [ ] T019 [US1] Deploy to Minikube using `helm install todo ./charts/todo`
- [ ] T020 [US1] Verify all pods reach Running state using `kubectl get pods`

**Checkpoint**: Application successfully deployed to Minikube via Helm

---

## Phase 5: User Story 2 - Access Frontend UI via Browser (Priority: P1)

**Goal**: Verify frontend is accessible and loads correctly in browser

**Independent Test**: Access frontend URL via `minikube service todo-frontend --url` and verify UI loads

### Validation for User Story 2

- [ ] T021 [US2] Get frontend URL using `minikube service todo-frontend --url`
- [ ] T022 [US2] Verify frontend UI loads in browser without errors
- [ ] T023 [US2] Verify all UI components render (including chat interface)
- [ ] T024 [US2] Verify page refresh loads consistently

**Checkpoint**: Frontend accessible and functional in browser

---

## Phase 6: User Story 3 - Chatbot End-to-End Functionality (Priority: P1)

**Goal**: Validate chatbot CRUD operations work post-deployment

**Independent Test**: Sign in and perform create, list, update, delete operations via chatbot

### Validation for User Story 3

- [ ] T025 [US3] Create Kubernetes secret with database credentials using `kubectl create secret`
- [ ] T026 [US3] Verify backend can connect to Neon database
- [ ] T027 [US3] Sign in to application via frontend
- [ ] T028 [US3] Test chatbot: Create task ("Add a task to buy groceries")
- [ ] T029 [US3] Test chatbot: List tasks ("Show my tasks")
- [ ] T030 [US3] Test chatbot: Update task ("Mark buy groceries as done")
- [ ] T031 [US3] Test chatbot: Delete task ("Delete the buy groceries task")

**Checkpoint**: All chatbot CRUD operations functional post-deployment

---

## Phase 7: User Story 5 - Scale Application Replicas (Priority: P2)

**Goal**: Verify application scales correctly and maintains functionality

**Independent Test**: Scale to 3 replicas and verify all pods reach Running state

### Validation for User Story 5

- [ ] T032 [US5] Scale backend to 3 replicas using `kubectl scale deployment todo-backend --replicas=3`
- [ ] T033 [US5] Verify all 3 backend pods reach Running state
- [ ] T034 [US5] Scale frontend to 2 replicas using `kubectl scale deployment todo-frontend --replicas=2`
- [ ] T035 [US5] Verify all frontend pods reach Running state
- [ ] T036 [US5] Verify application remains functional after scaling

**Checkpoint**: Application scales correctly without functionality loss

---

## Phase 8: User Story 6 - Configure via Environment Variables (Priority: P2)

**Goal**: Verify all configuration comes from Helm values and secrets

**Independent Test**: Deploy with custom values.yaml and verify configuration is applied

### Validation for User Story 6

- [ ] T037 [US6] Verify environment variables are injected into backend pods
- [ ] T038 [US6] Verify environment variables are injected into frontend pods
- [ ] T039 [US6] Verify secrets are not visible in pod specs (only secretKeyRef)
- [ ] T040 [US6] Verify no hardcoded secrets in Helm templates

**Checkpoint**: All configuration externalized via Helm values and secrets

---

## Phase 9: User Story 7 - Survive Pod Restarts (Priority: P2)

**Goal**: Validate stateless design by testing pod restart recovery

**Independent Test**: Create tasks, delete pods, verify tasks persist after restart

### Validation for User Story 7

- [ ] T041 [US7] Create test tasks via chatbot
- [ ] T042 [US7] Delete all backend pods using `kubectl delete pods -l app=todo-backend`
- [ ] T043 [US7] Wait for pods to restart and reach Running state
- [ ] T044 [US7] Verify tasks created before restart are still accessible
- [ ] T045 [US7] Verify conversation history persisted after restart

**Checkpoint**: Stateless design validated — data survives pod restarts

---

## Phase 10: Polish & Documentation

**Purpose**: Final documentation and cleanup

- [x] T046 [P] Update README.md with Kubernetes deployment instructions in README.md
- [x] T047 [P] Document secret creation process in README.md
- [x] T048 [P] Document common troubleshooting scenarios in README.md
- [ ] T049 Run full validation checklist from specs/008-k8s-deployment/quickstart.md
- [ ] T050 Update spec status from Draft to Complete in specs/008-k8s-deployment/spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS Docker builds
- **US4 Docker Images (Phase 3)**: Depends on Foundational — BLOCKS deployment
- **US1 Deploy (Phase 4)**: Depends on US4 — BLOCKS all validation
- **US2 Frontend Access (Phase 5)**: Depends on US1
- **US3 E2E Functionality (Phase 6)**: Depends on US1
- **US5 Scaling (Phase 7)**: Depends on US1
- **US6 Configuration (Phase 8)**: Depends on US1
- **US7 Restarts (Phase 9)**: Depends on US1
- **Polish (Phase 10)**: Depends on US1-US7 completion

### User Story Dependencies

```
US4 (Docker Images) ──┐
                      ├──► US1 (Deploy) ──┬──► US2 (Access)
Foundational ─────────┘                   ├──► US3 (E2E)
                                          ├──► US5 (Scale)
                                          ├──► US6 (Config)
                                          └──► US7 (Restarts)
```

### Within Each Phase

- Tasks marked [P] can run in parallel
- values.yaml updates (T011-T013) are sequential (same file)
- Probe additions (T014-T017) can run in parallel (different files)
- Validation tasks are sequential (depend on deployment state)

### Parallel Opportunities

**Phase 1 Parallel**:
```
T002 Create backend/.dockerignore
T003 Create frontend/.dockerignore
```

**Phase 4 Parallel (after T013)**:
```
T014 Add liveness probe to backend-deployment.yaml
T015 Add readiness probe to backend-deployment.yaml
T016 Add liveness probe to frontend-deployment.yaml
T017 Add readiness probe to frontend-deployment.yaml
```

**Phase 10 Parallel**:
```
T046 Update README with deployment instructions
T047 Document secret creation
T048 Document troubleshooting
```

---

## Implementation Strategy

### MVP First (US4 + US1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: US4 Docker Images (T006-T009)
4. Complete Phase 4: US1 Deploy (T010-T020)
5. **STOP and VALIDATE**: Pods running, basic deployment works
6. Demo deployment capability

### Incremental Validation

1. MVP deployed → Validate US2 (Frontend access)
2. US2 validated → Validate US3 (E2E chatbot)
3. US3 validated → Validate US5 (Scaling)
4. US5 validated → Validate US6 (Configuration)
5. US6 validated → Validate US7 (Restarts)
6. All validated → Complete documentation (Phase 10)

### Single Developer Flow

Work through phases sequentially:
1. Setup + Foundational (30 min)
2. US4 Docker Images (30 min)
3. US1 Deploy (45 min)
4. US2-US7 Validations (60 min)
5. Polish (30 min)

Total estimated: ~3 hours

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Validation tasks (US2, US3, US5-US7) require running deployment
- No automated tests — validation is manual per spec
- Commit after each task or logical group
- Stop at any checkpoint to validate progress
- All validation scenarios align with spec acceptance criteria
