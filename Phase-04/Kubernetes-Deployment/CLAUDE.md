# Phase IV: Local Kubernetes Deployment

**Objective**: Deploy the Todo Chatbot on a local Kubernetes cluster using Minikube, Helm Charts, and AI-assisted DevOps tools.

## Development Approach
**Agentic Dev Stack**: Write spec → Generate plan → Break into tasks → Implement via Claude Code.
*No manual coding allowed. All steps must be documented in `specs/`.*

## Requirements
1.  **Containerize**: Frontend and Backend (Use Docker/Gordon).
2.  **Helm Charts**: Create charts for deployment (Use `kubectl-ai` / `kagent`).
3.  **Deployment**: Deploy on Minikube locally.
4.  **AIOps**: Use Gordon, kubectl-ai, and kagent for operations.

## Technology Stack
-   **Containerization**: Docker (Docker Desktop), Docker AI Agent (Gordon)
-   **Orchestration**: Kubernetes (Minikube)
-   **Package Manager**: Helm Charts
-   **AI DevOps**: kubectl-ai, Kagent

## AI Commands
### Docker (Gordon)
```bash
docker ai "What can you do?"
docker ai "generate a Dockerfile for a FastAPI app"
```

### kubectl-ai
```bash
kubectl-ai "deploy the todo frontend with 2 replicas"
kubectl-ai "scale the backend to handle more load"
kubectl-ai "check why the pods are failing"
```

### kagent
```bash
kagent "analyze the cluster health"
kagent "optimize resource allocation"
```

## Work Directory
-   `/home/alihashmi/Hackathon-02/Phase-04/Kubernetes-Deployment`

## Spec-Kit Structure
-   `/specs/008-kubernetes-deployment/spec.md`
-   `/specs/008-kubernetes-deployment/plan.md`
-   `/specs/008-kubernetes-deployment/tasks.md`

## Active Technologies
- Python 3.12 (backend), Node.js 18 / TypeScript 5.6+ (frontend) + FastAPI, Next.js 16.0.10, Helm v3, Minikube, Docker Desktop (008-k8s-deployment)
- Neon Serverless PostgreSQL (external, not containerized) (008-k8s-deployment)

## Recent Changes
- 008-k8s-deployment: Added Python 3.12 (backend), Node.js 18 / TypeScript 5.6+ (frontend) + FastAPI, Next.js 16.0.10, Helm v3, Minikube, Docker Desktop
