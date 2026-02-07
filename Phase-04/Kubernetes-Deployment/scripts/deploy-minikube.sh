#!/bin/bash
#
# Deploy Todo AI Chatbot to Minikube
# Usage: ./scripts/deploy-minikube.sh
#
# Prerequisites:
#   - Docker Desktop with WSL integration enabled
#   - Minikube installed
#   - Helm v3 installed
#   - kubectl installed
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Todo AI Chatbot - Minikube Deployment                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
    fi
}

check_command docker
check_command minikube
check_command kubectl
check_command helm

echo ""

# Step 2: Start Minikube
echo -e "${YELLOW}[2/7] Starting Minikube...${NC}"
if minikube status | grep -q "Running"; then
    echo -e "${GREEN}✅ Minikube already running${NC}"
else
    minikube start --driver=docker --memory=4096 --cpus=2
    echo -e "${GREEN}✅ Minikube started${NC}"
fi
echo ""

# Step 3: Configure Docker to use Minikube's daemon
echo -e "${YELLOW}[3/7] Configuring Docker for Minikube...${NC}"
eval $(minikube docker-env)
echo -e "${GREEN}✅ Docker configured for Minikube${NC}"
echo ""

# Step 4: Build Docker images
echo -e "${YELLOW}[4/7] Building Docker images...${NC}"
echo "Building backend..."
docker build -t todo-backend:latest ./backend
BACKEND_SIZE=$(docker images todo-backend:latest --format "{{.Size}}")
echo -e "${GREEN}✅ Backend image built (${BACKEND_SIZE})${NC}"

echo "Building frontend..."
docker build -t todo-frontend:latest ./frontend
FRONTEND_SIZE=$(docker images todo-frontend:latest --format "{{.Size}}")
echo -e "${GREEN}✅ Frontend image built (${FRONTEND_SIZE})${NC}"
echo ""

# Step 5: Create secrets (if not exists)
echo -e "${YELLOW}[5/7] Checking secrets...${NC}"
if kubectl get secret todo-secrets &> /dev/null; then
    echo -e "${GREEN}✅ Secret 'todo-secrets' already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Secret 'todo-secrets' not found${NC}"
    echo ""
    echo "Please create the secret with your credentials:"
    echo ""
    echo "  kubectl create secret generic todo-secrets \\"
    echo "    --from-literal=DATABASE_URL='your-neon-database-url' \\"
    echo "    --from-literal=GEMINI_API_KEY='your-gemini-api-key' \\"
    echo "    --from-literal=BETTER_AUTH_SECRET='your-auth-secret'"
    echo ""
    read -p "Press Enter after creating the secret, or Ctrl+C to exit..."

    if ! kubectl get secret todo-secrets &> /dev/null; then
        echo -e "${RED}❌ Secret still not found. Exiting.${NC}"
        exit 1
    fi
fi
echo ""

# Step 6: Deploy with Helm
echo -e "${YELLOW}[6/7] Deploying with Helm...${NC}"
if helm list | grep -q "^todo"; then
    echo "Upgrading existing deployment..."
    helm upgrade todo ./charts/todo
else
    echo "Installing new deployment..."
    helm install todo ./charts/todo
fi
echo -e "${GREEN}✅ Helm deployment complete${NC}"
echo ""

# Step 7: Wait for pods and show status
echo -e "${YELLOW}[7/7] Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=120s || true
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT STATUS                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
kubectl get pods
echo ""
kubectl get services
echo ""

# Get frontend URL
FRONTEND_URL=$(minikube service todo-frontend --url 2>/dev/null || echo "Run: minikube service todo-frontend --url")
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Frontend URL: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Useful commands:"
echo "  kubectl logs -f -l app=todo-backend    # View backend logs"
echo "  kubectl logs -f -l app=todo-frontend   # View frontend logs"
echo "  helm uninstall todo                    # Remove deployment"
echo "  minikube stop                          # Stop Minikube"
