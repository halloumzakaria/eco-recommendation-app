#!/bin/bash

# GitHub Deployment Script for Eco-Recommendation App
echo "🚀 Deploying Eco-Recommendation App to GitHub"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Remove old GitHub remote${NC}"
git remote remove github

echo -e "${BLUE}Step 2: Add new GitHub remote${NC}"
echo "Please replace 'YOUR_USERNAME' with your actual GitHub username:"
echo "git remote add github https://github.com/YOUR_USERNAME/eco-recommendation-app.git"

echo -e "${BLUE}Step 3: Push to GitHub${NC}"
echo "git push -u github master"

echo -e "${GREEN}✅ Repository is ready for GitHub deployment!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create a new repository on GitHub.com"
echo "2. Copy the repository URL"
echo "3. Run: git remote add github YOUR_REPO_URL"
echo "4. Run: git push -u github master"
echo "5. Your app will be available on GitHub!"
