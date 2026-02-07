# Quickstart: Local Kubernetes Deployment

Deploy the AI Todo Chatbot to a local Minikube cluster in under 15 minutes.

## Prerequisites

Verify these tools are installed:

```bash
# Docker Desktop (or Docker Engine)
docker --version
# Expected: Docker version 24.x or later

# Minikube
minikube version
# Expected: minikube version: v1.32.x or later

# Helm
helm version
# Expected: version.BuildInfo{Version:"v3.x.x", ...}

# kubectl
kubectl version --client
# Expected: Client Version: v1.29.x or later
```

## Quick Deploy

### Step 1: Start Minikube

```bash
# Start Minikube with Docker driver
minikube start --driver=docker --memory=4096 --cpus=2

# Verify cluster is running
kubectl cluster-info
```

### Step 2: Configure Docker to Build Inside Minikube

```bash
# Point your shell to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker info | grep "Name:"
# Should show: Name: minikube
```

### Step 3: Build Docker Images

```bash
# Build backend image
docker build -t todo-backend:latest ./backend

# Build frontend image
docker build -t todo-frontend:latest ./frontend

# Verify images exist
docker images | grep todo
# Should show both todo-backend and todo-frontend
```

### Step 4: Create Kubernetes Secret

Create a secret with your environment variables:

```bash
# Create secret from your .env file values
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='your-neon-database-url' \
  --from-literal=GEMINI_API_KEY='your-gemini-api-key' \
  --from-literal=BETTER_AUTH_SECRET='your-auth-secret'

# Verify secret was created
kubectl get secrets todo-secrets
```

### Step 5: Deploy with Helm

```bash
# Install the Helm chart
helm install todo ./charts/todo

# Watch pods come up
kubectl get pods -w
# Wait until STATUS shows "Running" for both pods
# Press Ctrl+C to exit watch mode
```

### Step 6: Access the Application

```bash
# Get the frontend URL
minikube service todo-frontend --url

# Open the URL in your browser
# Example output: http://192.168.49.2:30080
```

## Verification Checklist

Run these commands to verify deployment:

```bash
# Check all pods are running
kubectl get pods
# Expected: todo-backend and todo-frontend both show "Running"

# Check services
kubectl get services
# Expected: todo-backend (ClusterIP), todo-frontend (NodePort)

# Check pod logs for errors
kubectl logs -l app=todo-backend --tail=50
kubectl logs -l app=todo-frontend --tail=50

# Test backend health
kubectl exec -it $(kubectl get pod -l app=todo-backend -o jsonpath='{.items[0].metadata.name}') -- curl localhost:8000/health
# Expected: {"status":"healthy",...}
```

## Common Operations

### View Logs

```bash
# Backend logs
kubectl logs -f -l app=todo-backend

# Frontend logs
kubectl logs -f -l app=todo-frontend
```

### Scale Replicas

```bash
# Scale backend to 3 replicas
kubectl scale deployment todo-backend --replicas=3

# Scale frontend to 2 replicas
kubectl scale deployment todo-frontend --replicas=2

# Or update via Helm
helm upgrade todo ./charts/todo --set replicaCount=3
```

### Update Configuration

```bash
# Update values and redeploy
helm upgrade todo ./charts/todo -f custom-values.yaml
```

### Restart Pods

```bash
# Restart all backend pods
kubectl rollout restart deployment todo-backend

# Restart all frontend pods
kubectl rollout restart deployment todo-frontend
```

### Uninstall

```bash
# Remove Helm release
helm uninstall todo

# Delete secret
kubectl delete secret todo-secrets

# Stop Minikube (optional)
minikube stop
```

## Troubleshooting

### Pods stuck in ImagePullBackOff

**Cause**: Images not built inside Minikube's Docker daemon.

**Fix**:
```bash
# Ensure you're using Minikube's Docker
eval $(minikube docker-env)

# Rebuild images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Delete and recreate pods
kubectl delete pods -l app=todo-backend
kubectl delete pods -l app=todo-frontend
```

### Pods stuck in CrashLoopBackOff

**Cause**: Application error on startup.

**Fix**:
```bash
# Check logs for error details
kubectl logs -l app=todo-backend --previous
kubectl describe pod -l app=todo-backend

# Common issues:
# - Missing DATABASE_URL secret
# - Invalid environment variables
# - Database unreachable from Minikube
```

### Cannot access frontend

**Cause**: Service not exposed correctly.

**Fix**:
```bash
# Verify service exists
kubectl get svc todo-frontend

# Use port-forward as alternative
kubectl port-forward svc/todo-frontend 3000:3000

# Then access at http://localhost:3000
```

### Database connection fails

**Cause**: Neon database not reachable from Minikube.

**Fix**:
- Ensure your Neon database allows connections from any IP (for development)
- Check that DATABASE_URL is correctly set in the secret
- Verify network connectivity: `kubectl exec -it <backend-pod> -- curl -v telnet://your-neon-host:5432`

## Environment Variables Reference

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | Neon PostgreSQL connection string | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| BETTER_AUTH_SECRET | JWT signing secret | Yes |
| BETTER_AUTH_URL | Frontend URL for auth | Yes |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |
| NEXT_PUBLIC_APP_URL | Frontend URL | Yes |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Minikube Cluster                         │
│                                                              │
│  ┌──────────────────┐       ┌──────────────────────┐        │
│  │  todo-frontend   │       │    todo-backend      │        │
│  │  (NodePort)      │──────▶│    (ClusterIP)       │        │
│  │  Port: 3000      │       │    Port: 8000        │        │
│  └──────────────────┘       └──────────────────────┘        │
│           │                           │                      │
└───────────│───────────────────────────│──────────────────────┘
            │                           │
            ▼                           ▼
      ┌──────────┐              ┌──────────────────┐
      │ Browser  │              │ Neon PostgreSQL  │
      │ (User)   │              │ (External)       │
      └──────────┘              └──────────────────┘
```
