#!/bin/bash

# Eco-Recommendation Test Runner
echo "🧪 Running Eco-Recommendation Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run tests
run_tests() {
    local service=$1
    local test_dir=$2
    local test_command=$3
    
    echo -e "\n${BLUE}Testing $service...${NC}"
    echo "----------------------------------------"
    
    cd "$test_dir"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $service tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ $service tests failed!${NC}"
        return 1
    fi
}

# Track test results
backend_passed=false
frontend_passed=false

# Run Backend Tests
echo -e "\n${YELLOW}Backend Tests${NC}"
echo "============="

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Run backend tests
if run_tests "Backend" "backend" "npm test"; then
    backend_passed=true
fi

# Run Frontend Tests
echo -e "\n${YELLOW}Frontend Tests${NC}"
echo "=============="

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Run frontend tests
if run_tests "Frontend" "frontend" "npm test -- --watchAll=false"; then
    frontend_passed=true
fi

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"

if [ "$backend_passed" = true ] && [ "$frontend_passed" = true ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
elif [ "$backend_passed" = true ]; then
    echo -e "${YELLOW}⚠️  Backend tests passed, Frontend tests failed${NC}"
    exit 1
elif [ "$frontend_passed" = true ]; then
    echo -e "${YELLOW}⚠️  Frontend tests passed, Backend tests failed${NC}"
    exit 1
else
    echo -e "${RED}❌ All tests failed!${NC}"
    exit 1
fi
