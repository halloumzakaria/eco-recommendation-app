#!/bin/bash

echo "🔍 Eco Recommendation API Debug Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

# Check container status
print_status "Checking container status..."
docker-compose ps

echo ""
print_status "Checking if containers are running..."
if docker-compose ps | grep -q "Up"; then
    print_success "Some containers are running"
else
    print_warning "No containers are running. Starting containers..."
    docker-compose up -d
    sleep 10
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 5

# Test NLP API directly
print_status "Testing NLP API directly..."
echo "Testing: http://localhost:5003/ai-search?q=hair"

if curl -s "http://localhost:5003/ai-search?q=hair" > /dev/null; then
    print_success "NLP API is responding"
    echo "Response:"
    curl -s "http://localhost:5003/ai-search?q=hair" | jq '.' 2>/dev/null || curl -s "http://localhost:5003/ai-search?q=hair"
else
    print_error "NLP API is not responding"
    echo "Checking NLP API logs:"
    docker-compose logs nlp_api --tail=10
fi

echo ""

# Test Backend API
print_status "Testing Backend API..."
echo "Testing: http://localhost:5000/api/products/search?q=hair"

if curl -s "http://localhost:5000/api/products/search?q=hair" > /dev/null; then
    print_success "Backend API is responding"
    echo "Response:"
    curl -s "http://localhost:5000/api/products/search?q=hair" | jq '.' 2>/dev/null || curl -s "http://localhost:5000/api/products/search?q=hair"
else
    print_error "Backend API is not responding"
    echo "Checking Backend logs:"
    docker-compose logs backend --tail=10
fi

echo ""

# Test Frontend
print_status "Testing Frontend..."
echo "Testing: http://localhost:3000"

if curl -s "http://localhost:3000" > /dev/null; then
    print_success "Frontend is responding"
else
    print_error "Frontend is not responding"
    echo "Checking Frontend logs:"
    docker-compose logs frontend --tail=10
fi

echo ""

# Test database connection
print_status "Testing database connection..."
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "Database is ready"
else
    print_error "Database is not ready"
fi

echo ""
print_status "Debug script completed!"
echo "If you see errors above, check the container logs with:"
echo "  docker-compose logs [service_name]"
echo ""
echo "To restart all services:"
echo "  docker-compose down && docker-compose up -d"
