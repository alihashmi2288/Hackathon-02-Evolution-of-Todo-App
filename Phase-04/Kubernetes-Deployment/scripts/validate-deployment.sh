#!/bin/bash
#
# Validate Todo AI Chatbot Deployment
# Usage: ./scripts/validate-deployment.sh
#
# Runs validation tests for all user stories
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    local name=$1
    local cmd=$2
    echo -n "  Testing: $name... "
    if eval "$cmd" &> /dev/null; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        ((FAIL++))
    fi
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Deployment Validation Test Suite                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# US1: Deploy Application
echo -e "${YELLOW}[US1] Deploy Application to Local Kubernetes${NC}"
check "Minikube running" "minikube status | grep -q Running"
check "Backend pod exists" "kubectl get pods -l app=todo-backend -o name | grep -q pod/"
check "Frontend pod exists" "kubectl get pods -l app=todo-frontend -o name | grep -q pod/"
check "Backend pod running" "kubectl get pods -l app=todo-backend -o jsonpath='{.items[0].status.phase}' | grep -q Running"
check "Frontend pod running" "kubectl get pods -l app=todo-frontend -o jsonpath='{.items[0].status.phase}' | grep -q Running"
check "Backend service exists" "kubectl get svc todo-backend -o name | grep -q service/"
check "Frontend service exists" "kubectl get svc todo-frontend -o name | grep -q service/"
echo ""

# US2: Access Frontend UI
echo -e "${YELLOW}[US2] Access Frontend UI via Browser${NC}"
FRONTEND_URL=$(minikube service todo-frontend --url 2>/dev/null || echo "")
if [ -n "$FRONTEND_URL" ]; then
    check "Frontend URL accessible" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL | grep -q 200"
else
    echo -e "  ${RED}Could not get frontend URL${NC}"
    ((FAIL++))
fi
echo ""

# US4: Docker Images
echo -e "${YELLOW}[US4] Docker Images${NC}"
check "Backend image exists" "docker images todo-backend:latest -q | grep -q ."
check "Frontend image exists" "docker images todo-frontend:latest -q | grep -q ."

# Check image sizes
BACKEND_SIZE=$(docker images todo-backend:latest --format "{{.Size}}" 2>/dev/null || echo "0MB")
FRONTEND_SIZE=$(docker images todo-frontend:latest --format "{{.Size}}" 2>/dev/null || echo "0MB")
echo "  Backend image size: $BACKEND_SIZE"
echo "  Frontend image size: $FRONTEND_SIZE"
echo ""

# US5: Scaling
echo -e "${YELLOW}[US5] Scale Application Replicas${NC}"
echo "  Scaling backend to 2 replicas..."
kubectl scale deployment todo-backend --replicas=2 &> /dev/null || true
sleep 5
BACKEND_REPLICAS=$(kubectl get deployment todo-backend -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
check "Backend scaled to 2" "[ '$BACKEND_REPLICAS' -ge 2 ]"
echo "  Scaling back to 1..."
kubectl scale deployment todo-backend --replicas=1 &> /dev/null || true
echo ""

# US6: Configuration
echo -e "${YELLOW}[US6] Configure via Environment Variables${NC}"
check "Secret exists" "kubectl get secret todo-secrets -o name | grep -q secret/"
check "Backend uses secretKeyRef" "kubectl get deployment todo-backend -o yaml | grep -q secretKeyRef"
check "No hardcoded secrets in deployment" "! kubectl get deployment todo-backend -o yaml | grep -E 'DATABASE_URL:|GEMINI_API_KEY:' | grep -v secretKeyRef"
echo ""

# US7: Pod Restarts
echo -e "${YELLOW}[US7] Survive Pod Restarts${NC}"
echo "  Restarting backend pods..."
kubectl rollout restart deployment todo-backend &> /dev/null || true
sleep 10
kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=60s &> /dev/null || true
check "Backend recovered after restart" "kubectl get pods -l app=todo-backend -o jsonpath='{.items[0].status.phase}' | grep -q Running"
echo ""

# Health Probes
echo -e "${YELLOW}[Health] Probe Verification${NC}"
BACKEND_POD=$(kubectl get pod -l app=todo-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$BACKEND_POD" ]; then
    check "Backend /health responds" "kubectl exec $BACKEND_POD -- curl -s localhost:8000/health | grep -q healthy"
    check "Backend /health/ready responds" "kubectl exec $BACKEND_POD -- curl -s localhost:8000/health/ready | grep -q ready"
else
    echo -e "  ${RED}No backend pod found${NC}"
    ((FAIL+=2))
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    VALIDATION SUMMARY                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All validation tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi
