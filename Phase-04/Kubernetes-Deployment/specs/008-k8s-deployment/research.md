# Research: Local Kubernetes Deployment

**Feature**: 008-k8s-deployment
**Date**: 2026-02-05

## Research Areas

### 1. FastAPI Multi-Stage Dockerfile Best Practices

**Decision**: Use a three-stage build pattern (builder → deps → runtime)

**Rationale**:
- Separates build dependencies from runtime
- Uses `python:3.12-slim` for smaller final image
- Excludes development tools like `build-essential` from production
- Copies only necessary files (no .venv, tests, or dev configs)

**Pattern**:
```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim AS builder
RUN pip install --user --no-cache-dir <deps>

# Stage 2: Runtime
FROM python:3.12-slim AS runtime
COPY --from=builder /root/.local /root/.local
COPY app/ ./app/
```

**Alternatives Considered**:
- Single-stage build (current): Rejected — includes build tools in production, larger image
- Alpine-based image: Rejected — compatibility issues with some Python packages

---

### 2. Minikube Image Loading Strategy

**Decision**: Build images directly inside Minikube's Docker daemon using `eval $(minikube docker-env)`

**Rationale**:
- Simplest approach for local development
- No registry setup required
- Images are immediately available to Kubernetes
- Combined with `imagePullPolicy: Never` ensures local images are used

**Workflow**:
```bash
# Point shell to Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (they're now inside Minikube)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Deploy (images are already present)
helm install todo ./charts/todo
```

**Alternatives Considered**:
- `minikube image load`: Rejected — requires building locally first, then transferring
- Local registry (localhost:5000): Rejected — adds complexity for local development

---

### 3. Kubernetes Health Probe Configuration

**Decision**: Use HTTP GET probes for both liveness and readiness

**Rationale**:
- HTTP probes are simple and reliable for web services
- Backend already has `/health` and `/health/ready` endpoints
- Frontend can use root path `/` as a simple health check

**Configuration Pattern**:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Timing Decisions**:
- `initialDelaySeconds`: Backend 10s (startup time), Frontend 15s (Next.js startup)
- `periodSeconds`: 30s for liveness (don't restart too aggressively), 10s for readiness (quick traffic routing)
- `failureThreshold`: 3 attempts before action

**Alternatives Considered**:
- TCP socket probes: Rejected — doesn't verify application logic
- Exec probes: Rejected — adds complexity, slower execution

---

### 4. Next.js Standalone Output for Docker

**Decision**: Frontend Dockerfile already uses standalone output correctly

**Rationale**:
- `output: 'standalone'` in next.config.js creates a minimal production build
- Copies only necessary files (no node_modules bulk)
- Results in smaller image sizes (typically < 200MB)

**Verification**:
The existing frontend Dockerfile correctly:
1. Uses multi-stage build (deps → builder → runner)
2. Copies standalone output from builder stage
3. Runs as non-root user (nextjs:nodejs)
4. Sets `NODE_ENV=production`

**No Changes Required** — Frontend Dockerfile is compliant.

---

### 5. Helm Chart Resource Configuration

**Decision**: Define reasonable defaults for local development

**Rationale**:
- Resource limits prevent runaway containers from consuming all Minikube resources
- Requests ensure pods get scheduled appropriately
- Values chosen based on typical Next.js/FastAPI resource usage

**Configuration**:
```yaml
resources:
  backend:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  frontend:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
```

**Alternatives Considered**:
- No resource limits: Rejected — could cause Minikube instability
- Higher limits: Rejected — unnecessary for local development

---

### 6. Service Exposure for Minikube

**Decision**: Use NodePort for frontend service

**Rationale**:
- NodePort works reliably with `minikube service` command
- LoadBalancer requires `minikube tunnel` which adds complexity
- NodePort provides deterministic access pattern

**Access Pattern**:
```bash
# Get frontend URL
minikube service todo-frontend --url

# Or use port-forward for more control
kubectl port-forward svc/todo-frontend 3000:3000
```

**Alternatives Considered**:
- LoadBalancer: Rejected — requires running `minikube tunnel` separately
- Ingress: Rejected — adds complexity for local development; optional enhancement

---

## Summary of Decisions

| Area | Decision | Impact |
|------|----------|--------|
| Backend Dockerfile | Multi-stage build | Image size < 300MB |
| Image Loading | `eval $(minikube docker-env)` | No registry needed |
| Health Probes | HTTP GET probes | Kubernetes manages pod lifecycle |
| Frontend Dockerfile | No changes | Already compliant |
| Resource Limits | Conservative defaults | Stable Minikube operation |
| Service Exposure | NodePort | Simple access via `minikube service` |
