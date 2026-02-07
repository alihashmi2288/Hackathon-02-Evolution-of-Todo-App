# Todo AI Chatbot

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
*   **Kubernetes Ready**: Deploy to Minikube with a single Helm command.

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

### Infrastructure
*   **Container**: Docker with multi-stage builds
*   **Orchestration**: Kubernetes (Minikube for local development)
*   **Package Manager**: Helm v3

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

---

## ☸️ Kubernetes Deployment

Deploy the application to a local Minikube cluster using Helm.

### Prerequisites

**Required Tools:**
```bash
# Verify required tools
docker --version        # Docker 24.x+
minikube version        # Minikube v1.32.x+
helm version            # Helm v3.x+
kubectl version --client # kubectl v1.29.x+
```

**WSL2 Setup (Windows):**
If using Windows with WSL2:
1. Install Docker Desktop and enable WSL2 integration in Settings → Resources → WSL Integration
2. Install Minikube in WSL: `curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube`
3. Install kubectl: `curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && sudo install kubectl /usr/local/bin/kubectl`
4. Install Helm: `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash`

### Automated Deploy (Recommended)

Use the provided deployment script:

```bash
./scripts/deploy-minikube.sh
```

This script will:
1. Check all prerequisites
2. Start Minikube
3. Build Docker images inside Minikube
4. Guide you through secret creation
5. Deploy with Helm
6. Display the frontend URL

### Validate Deployment

After deployment, run the validation script:

```bash
./scripts/validate-deployment.sh
```

This validates all user stories (US1-US7).

### Manual Deploy

#### Step 1: Start Minikube

```bash
minikube start --driver=docker --memory=4096 --cpus=2
kubectl cluster-info
```

#### Step 2: Configure Docker to Build Inside Minikube

```bash
# Point shell to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify (should show "Name: minikube")
docker info | grep "Name:"
```

#### Step 3: Build Docker Images

```bash
# Build backend image (multi-stage, < 300MB)
docker build -t todo-backend:latest ./backend

# Build frontend image (multi-stage, < 500MB)
docker build -t todo-frontend:latest ./frontend

# Verify images
docker images | grep todo
```

#### Step 4: Create Kubernetes Secrets

```bash
# Create secret with your credentials
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@host/db?sslmode=require' \
  --from-literal=GEMINI_API_KEY='your-gemini-api-key' \
  --from-literal=BETTER_AUTH_SECRET='your-auth-secret-min-32-chars'

# Verify secret
kubectl get secrets todo-secrets
```

**⚠️ Security Note**: Never commit real credentials. Use `.env` files locally or a secrets manager in production.

#### Step 5: Deploy with Helm

```bash
# Install the Helm chart
helm install todo ./charts/todo

# Watch pods come up (Ctrl+C to exit)
kubectl get pods -w
```

Wait until both pods show `STATUS: Running`.

#### Step 6: Access the Application

```bash
# Get frontend URL
minikube service todo-frontend --url

# Example output: http://192.168.49.2:30080
# Open this URL in your browser
```

### Common Operations

#### View Logs

```bash
kubectl logs -f -l app=todo-backend    # Backend logs
kubectl logs -f -l app=todo-frontend   # Frontend logs
```

#### Scale Replicas

```bash
kubectl scale deployment todo-backend --replicas=3
kubectl scale deployment todo-frontend --replicas=2
```

#### Restart Pods

```bash
kubectl rollout restart deployment todo-backend
kubectl rollout restart deployment todo-frontend
```

#### Update Configuration

```bash
helm upgrade todo ./charts/todo -f custom-values.yaml
```

#### Uninstall

```bash
helm uninstall todo
kubectl delete secret todo-secrets
minikube stop
```

### Troubleshooting

#### Pods stuck in `ImagePullBackOff`

**Cause**: Images not built inside Minikube's Docker daemon.

```bash
eval $(minikube docker-env)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend
kubectl delete pods -l app=todo-backend
kubectl delete pods -l app=todo-frontend
```

#### Pods stuck in `CrashLoopBackOff`

**Cause**: Application error on startup.

```bash
kubectl logs -l app=todo-backend --previous
kubectl describe pod -l app=todo-backend
```

Common issues:
- Missing `todo-secrets` secret
- Invalid DATABASE_URL
- Database unreachable from Minikube

#### Cannot access frontend

```bash
# Verify service exists
kubectl get svc todo-frontend

# Use port-forward as alternative
kubectl port-forward svc/todo-frontend 3000:3000
# Access at http://localhost:3000
```

#### Database connection fails

- Ensure Neon database allows connections from any IP (for development)
- Verify DATABASE_URL is correctly set in the secret
- Check connectivity: `kubectl exec -it <pod> -- curl -v telnet://host:5432`

---

## 🧠 Architecture Highlights

*   **Agent Integration**: The `Todo Agent` is defined in `backend/app/agent.py`. It wraps standard Python functions as MCP tools.
*   **Tool Compatibility**: We implement a custom `function_tool` wrapper to generate JSON schemas compatible with the `agents` library and Gemini's function calling API.
*   **Scoped Execution**: In `backend/app/routers/chat.py`, we create per-request agents that inject the authenticated `user_id` into tool calls automatically, providing a seamless UX.
*   **Stateless Design**: Services are stateless; all data persists in Neon PostgreSQL. Pods can restart without data loss.

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

---

## 📚 Documentation

- [Quickstart Guide](specs/008-k8s-deployment/quickstart.md) - Detailed deployment steps
- [Specification](specs/008-k8s-deployment/spec.md) - Feature requirements
- [Implementation Plan](specs/008-k8s-deployment/plan.md) - Technical design
