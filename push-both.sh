#!/bin/bash

# 🔄 Push to Both GitLab and GitHub
# This script pushes your changes to both repositories

echo "🚀 Pushing to both GitLab and GitHub..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first:"
    echo "git add ."
    echo "git commit -m 'Your commit message'"
    exit 1
fi

# Push to GitLab (origin)
print_status "Pushing to GitLab (school)..."
if git push origin master; then
    print_status "Successfully pushed to GitLab!"
else
    print_error "Failed to push to GitLab"
    exit 1
fi

# Push to GitHub
print_status "Pushing to GitHub (deployment)..."
if git push github master; then
    print_status "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

print_status "🎉 Successfully pushed to both repositories!"
echo ""
echo "📊 Repository Status:"
echo "  GitLab (school): https://rendu-git.etna-alternance.net"
echo "  GitHub (deploy): https://github.com/maryamnajari/ecosphere-app"
