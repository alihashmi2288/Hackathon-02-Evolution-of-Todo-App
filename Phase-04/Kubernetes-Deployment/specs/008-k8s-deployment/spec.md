# Feature Specification: Local Kubernetes Deployment

**Feature Branch**: `008-k8s-deployment`
**Created**: 2026-02-05
**Status**: Draft
**Spec ID**: PHASE-IV-K8S-DEPLOYMENT-001
**Input**: User description: "Phase IV: Deploy AI Todo Chatbot to local Kubernetes cluster using Minikube, Helm Charts, and AI-assisted DevOps tools"

## Overview

Deploy the existing **Phase III AI Todo Chatbot** (Frontend + Backend + MCP + AI Agent) to a **local Kubernetes cluster using Minikube**, following **cloud-native best practices** and **AI-assisted DevOps workflows**.

This specification assumes:
- Existing containerization or Kubernetes work may exist in the repository
- Existing work MAY be incorrect, incomplete, or non-compliant with best practices
- Analysis must precede implementation; fix or replace non-compliant artifacts

**Authoritative Status**: This spec supersedes any existing deployment configurations.

---

## Clarifications

### Session 2026-02-05

- Q: How should Docker images be loaded into Minikube? → A: Build inside Minikube's Docker daemon using `eval $(minikube docker-env)`
- Q: Should health/readiness probes be configured? → A: Both liveness and readiness probes required for frontend and backend
- Q: What imagePullPolicy should be used? → A: `imagePullPolicy: Never` — only use local images
- Q: What Helm chart structure should be used? → A: Single chart with all templates in `charts/todo/templates/`

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Application to Local Kubernetes (Priority: P1)

As a developer, I can deploy the complete AI Todo Chatbot application (frontend and backend) to a local Minikube cluster using a single Helm command, so that I can run the full system in a production-like environment.

**Why this priority**: Core deployment capability — without successful Helm deployment, no other testing or validation is possible.

**Independent Test**: Run `helm install` command and verify both frontend and backend pods reach Running state within 2 minutes.

**Acceptance Scenarios**:

1. **Given** Minikube is running and Helm is installed, **When** the operator runs `helm install todo ./charts/todo`, **Then** the deployment succeeds without errors and all pods become Ready.
2. **Given** a fresh Minikube cluster with no prior deployments, **When** the Helm chart is installed, **Then** all required Kubernetes resources (Deployments, Services, ConfigMaps) are created.
3. **Given** the Helm chart is installed, **When** the operator checks pod status, **Then** frontend and backend pods show `Running` status with all containers ready.

---

### User Story 2 - Access Frontend UI via Browser (Priority: P1)

As a user, I can access the Todo Chatbot frontend through my browser after deployment, so that I can interact with the application.

**Why this priority**: Validates that the frontend is correctly containerized, deployed, and accessible — essential for end-to-end testing.

**Independent Test**: Open the exposed frontend URL in a browser and verify the UI loads correctly.

**Acceptance Scenarios**:

1. **Given** the application is deployed to Minikube, **When** the user accesses the frontend URL (via NodePort or minikube service), **Then** the Todo Chatbot UI loads without errors.
2. **Given** the frontend is accessible, **When** the user views the page, **Then** all UI components render correctly including the chat interface.
3. **Given** the frontend is running, **When** the user refreshes the page, **Then** the application loads consistently without failures.

---

### User Story 3 - Chatbot End-to-End Functionality (Priority: P1)

As a user, I can use the chatbot to create, list, update, and delete tasks after Kubernetes deployment, exactly as I could in the local development environment.

**Why this priority**: Validates that containerization and deployment did not break application functionality — the ultimate measure of deployment success.

**Independent Test**: Sign in and perform all CRUD operations via the chatbot; verify each operation succeeds.

**Acceptance Scenarios**:

1. **Given** a deployed and accessible application, **When** an authenticated user types "Add a task to buy groceries", **Then** the task is created and the chatbot confirms creation.
2. **Given** a user with existing tasks, **When** the user types "Show my tasks", **Then** the chatbot returns the correct list of tasks.
3. **Given** a user with a task, **When** the user types "Delete the buy groceries task", **Then** the task is deleted and the chatbot confirms deletion.
4. **Given** a user with a task, **When** the user types "Mark buy groceries as done", **Then** the task is marked complete and the chatbot confirms.

---

### User Story 4 - Build Docker Images (Priority: P1)

As a developer, I can build production-ready Docker images for both frontend and backend services using multi-stage builds, so that the images are optimized for Kubernetes deployment.

**Why this priority**: Images must exist before Kubernetes deployment can occur — this is a prerequisite for all other stories.

**Independent Test**: Run `docker build` for each service and verify images are created with reasonable sizes (< 500MB for frontend, < 300MB for backend).

**Acceptance Scenarios**:

1. **Given** the frontend source code, **When** the developer builds the Docker image, **Then** the image is created successfully using a multi-stage build.
2. **Given** the backend source code, **When** the developer builds the Docker image, **Then** the image is created successfully with all dependencies included.
3. **Given** built images, **When** the developer inspects the image sizes, **Then** production images contain no development dependencies or build artifacts.

---

### User Story 5 - Scale Application Replicas (Priority: P2)

As an operator, I can scale the frontend and backend deployments independently using Helm values or kubectl commands, so that I can adjust capacity based on needs.

**Why this priority**: Important for validating stateless design but not required for basic deployment validation.

**Independent Test**: Scale replicas from 1 to 3 and verify all pods reach Running state and application continues functioning.

**Acceptance Scenarios**:

1. **Given** a deployed application with 1 replica each, **When** the operator scales frontend to 3 replicas, **Then** all 3 pods become Ready and the application remains functional.
2. **Given** scaled replicas, **When** requests are made to the application, **Then** traffic is distributed across all healthy pods.
3. **Given** a scaled deployment, **When** one pod is terminated, **Then** Kubernetes restarts it and the application remains available.

---

### User Story 6 - Configure via Environment Variables (Priority: P2)

As an operator, I can configure all application settings via Helm values without modifying source code or Docker images, so that I can deploy to different environments with different configurations.

**Why this priority**: Essential for production readiness but the application functions with default values for local testing.

**Independent Test**: Deploy with custom values.yaml and verify the application uses the provided configuration.

**Acceptance Scenarios**:

1. **Given** a values.yaml with custom API URL, **When** the Helm chart is installed, **Then** the frontend uses the specified backend URL.
2. **Given** a values.yaml with resource limits, **When** the deployment is created, **Then** pods are created with the specified CPU and memory limits.
3. **Given** sensitive configuration (database URL, API keys), **When** the deployment is examined, **Then** no secrets are visible in ConfigMaps or pod specs.

---

### User Story 7 - Survive Pod Restarts (Priority: P2)

As a user, I can continue using the application after backend pods restart, with my data intact, because the system is stateless and all state is persisted externally.

**Why this priority**: Validates stateless design compliance — critical for production but secondary to basic functionality.

**Independent Test**: Create tasks, delete backend pods, wait for restart, verify tasks are still accessible.

**Acceptance Scenarios**:

1. **Given** a user has created tasks, **When** backend pods are deleted and recreated, **Then** all previously created tasks remain accessible.
2. **Given** a user is in the middle of a chat session, **When** the backend restarts, **Then** conversation history is preserved and the user can continue.
3. **Given** no persistent volumes are attached to pods, **When** pods restart, **Then** the application functions identically because all state is in external database.

---

### Edge Cases

- What happens when Minikube runs out of memory? The deployment fails gracefully with clear error messages; resource limits prevent individual pods from consuming all available resources.
- What happens when the external database (Neon) is unreachable? The backend returns appropriate error responses (503); pods remain running and recover when connectivity is restored.
- What happens when a Docker build fails? The build process outputs clear error messages indicating the failure point; no partial images are created.
- What happens when Helm values are misconfigured? Helm validation catches schema errors before deployment; runtime misconfigurations result in clear pod error states.
- What happens when images are not found? Kubernetes reports `ImagePullBackOff` status; deployment instructions clarify that images must be built inside Minikube's Docker daemon using `eval $(minikube docker-env)` before deploying.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Containerization
- **FR-001**: System MUST provide Dockerfiles for both frontend and backend services
- **FR-002**: Docker builds MUST use multi-stage builds to minimize production image sizes
- **FR-003**: Production images MUST NOT contain development dependencies, source maps, or test files
- **FR-004**: Images MUST accept all configuration via environment variables at runtime
- **FR-005**: Images MUST expose the correct ports (3000 for frontend, 8000 for backend)
- **FR-022**: Images MUST be built inside Minikube's Docker daemon using `eval $(minikube docker-env)` to avoid registry setup
- **FR-025**: Helm chart MUST set `imagePullPolicy: Never` to ensure only locally-built images are used

#### Helm Charts
- **FR-006**: System MUST provide a Helm chart that deploys both frontend and backend services
- **FR-007**: Helm chart MUST support configuration via values.yaml without chart modifications
- **FR-008**: Helm chart MUST define resource requests and limits for all containers
- **FR-009**: Helm chart MUST support configurable replica counts for each service
- **FR-010**: Helm chart MUST inject environment variables from values.yaml into pods
- **FR-026**: Helm chart MUST use single-chart structure with all templates in `charts/todo/templates/` (no subcharts)

#### Kubernetes Resources
- **FR-011**: Frontend MUST be exposed via NodePort or Ingress for Minikube accessibility
- **FR-012**: Backend MUST be exposed via ClusterIP for internal-only access
- **FR-013**: Frontend MUST communicate with backend using Kubernetes internal DNS
- **FR-014**: All configuration MUST be managed via ConfigMaps and Secrets
- **FR-015**: No secrets MUST be committed to version control
- **FR-023**: Both frontend and backend MUST have liveness probes to detect stuck containers
- **FR-024**: Both frontend and backend MUST have readiness probes to control traffic routing during startup and failures

#### Stateless Design
- **FR-016**: Services MUST NOT store any state in container filesystems
- **FR-017**: Services MUST function correctly after pod restarts without data loss
- **FR-018**: Scaling replicas MUST NOT require configuration changes
- **FR-019**: All persistent state MUST reside in external database (Neon PostgreSQL)

#### AI-Assisted Operations
- **FR-020**: Deployment workflow SHOULD prefer AI-assisted tools (Gordon, kubectl-ai, kagent) when available
- **FR-021**: System MUST provide fallback to manually-written configurations when AI tools are unavailable

### Key Entities

- **Docker Image**: Container image for a service, tagged with version, containing runtime dependencies and application code
- **Helm Chart**: Kubernetes deployment package containing templates, values schema, and dependencies
- **Deployment**: Kubernetes workload managing pod replicas with rolling update strategy
- **Service**: Kubernetes network abstraction exposing pods via ClusterIP or NodePort
- **ConfigMap**: Kubernetes resource storing non-sensitive configuration as key-value pairs
- **Secret**: Kubernetes resource storing sensitive configuration (database URLs, API keys)

---

## Assumptions

- Minikube is installed and functional on the developer's machine
- Docker Desktop is available for image building
- Helm v3 is installed
- The Phase III AI Todo Chatbot (frontend, backend, MCP, AI agent) is fully functional
- Neon PostgreSQL database is accessible from the local network
- The developer has basic familiarity with Kubernetes concepts
- AI DevOps tools (Gordon, kubectl-ai, kagent) may or may not be available — the spec supports both scenarios
- A single namespace (`default` or `todo`) is sufficient for local deployment
- Ingress controller is optional; NodePort provides adequate access for local testing

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `minikube start` followed by `helm install todo ./charts/todo` succeeds without manual intervention
- **SC-002**: All pods reach Running state within 2 minutes of Helm install
- **SC-003**: Frontend UI is accessible via browser within 30 seconds of pods becoming Ready
- **SC-004**: Chatbot successfully executes all CRUD operations (create, list, update, delete tasks) post-deployment
- **SC-005**: Docker images are under 500MB (frontend) and 300MB (backend)
- **SC-006**: Scaling replicas from 1 to 3 completes within 60 seconds with all pods Running
- **SC-007**: Application functionality is preserved after deleting and recreating all backend pods
- **SC-008**: Zero secrets (database URLs, API keys) appear in version-controlled files
- **SC-009**: No manual `kubectl apply` of raw YAML files is required — all deployment via Helm
- **SC-010**: Deployment instructions can be followed by a developer unfamiliar with the project in under 15 minutes

---

## Deliverables

- `frontend/Dockerfile` — Production-optimized multi-stage Dockerfile for Next.js
- `backend/Dockerfile` — Production-optimized multi-stage Dockerfile for FastAPI
- `charts/todo/Chart.yaml` — Helm chart metadata
- `charts/todo/values.yaml` — Default configuration values
- `charts/todo/templates/` — Kubernetes resource templates
- `README.md` — Updated deployment instructions
- `specs/008-k8s-deployment/analysis.md` — Analysis of existing artifacts and remediation notes

---

## Constraints

- Use Docker Desktop for containerization
- Use Minikube for local Kubernetes cluster
- Use Helm Charts for deployment (no raw kubectl YAML)
- Prefer AI-assisted tools when available; fall back to Claude Code generation
- Database remains external (Neon PostgreSQL) — not containerized
- No hardcoded secrets in any committed files
- Stateless services only — no persistent volumes for application pods
