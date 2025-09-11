#!/bin/bash

# 🚀 Ecosphere Railway Deployment Script
# This script provides multiple deployment options for your Ecosphere application

echo "🌱 Ecosphere Railway Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        curl -fsSL https://railway.app/install.sh | sh
        print_status "Railway CLI installed successfully"
    else
        print_status "Railway CLI is already installed"
    fi
}

# Option 1: Deploy directly from local code
deploy_local() {
    print_info "Deploying from local code..."
    
    # Login to Railway
    railway login
    
    # Initialize project
    railway init
    
    # Set environment variables
    print_info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set SECRET_KEY=$(openssl rand -base64 32)
    railway variables set POSTGRES_PASSWORD=$(openssl rand -base64 16)
    railway variables set REACT_APP_API_URL=https://your-backend-url.railway.app/api
    railway variables set REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
    
    # Deploy
    railway up
}

# Option 2: Deploy from GitHub
deploy_github() {
    print_info "Setting up GitHub deployment..."
    
    echo "Please follow these steps:"
    echo "1. Go to https://github.com and create a new repository"
    echo "2. Name it: ecosphere-app"
    echo "3. Make it public"
    echo "4. Push your code to GitHub:"
    echo "   git remote add github https://github.com/YOUR_USERNAME/ecosphere-app.git"
    echo "   git push -u github master"
    echo "5. Go to https://railway.app"
    echo "6. Click 'New Project' > 'Deploy from GitHub repo'"
    echo "7. Connect your GitHub account and select ecosphere-app"
    echo "8. Configure environment variables in Railway dashboard"
}

# Option 3: Manual upload
deploy_manual() {
    print_info "Preparing for manual upload..."
    
    # Create a deployment package
    tar -czf ecosphere-deployment.tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=mon_env \
        --exclude=*.log \
        .
    
    print_status "Created ecosphere-deployment.tar.gz"
    print_info "Upload this file to Railway:"
    echo "1. Go to https://railway.app"
    echo "2. Click 'New Project' > 'Empty Project'"
    echo "3. Upload ecosphere-deployment.tar.gz"
    echo "4. Configure environment variables"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment option:"
    echo "1) Deploy directly from local code (CLI)"
    echo "2) Deploy from GitHub (Recommended)"
    echo "3) Manual upload to Railway"
    echo "4) Show environment variables needed"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
}

# Show environment variables
show_env_vars() {
    print_info "Required Environment Variables for Railway:"
    echo ""
    echo "NODE_ENV=production"
    echo "SECRET_KEY=your_super_secret_jwt_key_here_change_this"
    echo "POSTGRES_PASSWORD=your_secure_password_here"
    echo "REACT_APP_API_URL=https://your-backend-url.railway.app/api"
    echo "REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app"
    echo ""
    print_warning "Replace the URLs with your actual Railway deployment URLs"
}

# Main execution
main() {
    check_railway_cli
    
    while true; do
        show_menu
        case $choice in
            1)
                deploy_local
                break
                ;;
            2)
                deploy_github
                break
                ;;
            3)
                deploy_manual
                break
                ;;
            4)
                show_env_vars
                ;;
            5)
                print_info "Goodbye! 🌱"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
    done
}

# Run main function
main