# 🚀 Ecosphere Railway Deployment Script (Windows PowerShell)
# This script provides multiple deployment options for your Ecosphere application

Write-Host "🌱 Ecosphere Railway Deployment Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if Railway CLI is installed
function Test-RailwayCLI {
    try {
        railway --version | Out-Null
        Write-Status "Railway CLI is already installed"
        return $true
    }
    catch {
        Write-Warning "Railway CLI not found. Please install it manually:"
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Click 'Install CLI'"
        Write-Host "3. Follow the installation instructions"
        return $false
    }
}

# Option 1: Deploy directly from local code
function Deploy-Local {
    Write-Info "Deploying from local code..."
    
    # Login to Railway
    railway login
    
    # Initialize project
    railway init
    
    # Set environment variables
    Write-Info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set SECRET_KEY=(New-Guid).ToString()
    railway variables set POSTGRES_PASSWORD=(New-Guid).ToString()
    railway variables set REACT_APP_API_URL=https://your-backend-url.railway.app/api
    railway variables set REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
    
    # Deploy
    railway up
}

# Option 2: Deploy from GitHub
function Deploy-GitHub {
    Write-Info "Setting up GitHub deployment..."
    
    Write-Host "Please follow these steps:"
    Write-Host "1. Go to https://github.com and create a new repository"
    Write-Host "2. Name it: ecosphere-app"
    Write-Host "3. Make it public"
    Write-Host "4. Push your code to GitHub:"
    Write-Host "   git remote add github https://github.com/YOUR_USERNAME/ecosphere-app.git"
    Write-Host "   git push -u github master"
    Write-Host "5. Go to https://railway.app"
    Write-Host "6. Click 'New Project' > 'Deploy from GitHub repo'"
    Write-Host "7. Connect your GitHub account and select ecosphere-app"
    Write-Host "8. Configure environment variables in Railway dashboard"
}

# Option 3: Manual upload
function Deploy-Manual {
    Write-Info "Preparing for manual upload..."
    
    # Create a deployment package
    Compress-Archive -Path ".\*" -DestinationPath "ecosphere-deployment.zip" -Exclude @("node_modules", ".git", "mon_env", "*.log")
    
    Write-Status "Created ecosphere-deployment.zip"
    Write-Info "Upload this file to Railway:"
    Write-Host "1. Go to https://railway.app"
    Write-Host "2. Click 'New Project' > 'Empty Project'"
    Write-Host "3. Upload ecosphere-deployment.zip"
    Write-Host "4. Configure environment variables"
}

# Show environment variables
function Show-EnvVars {
    Write-Info "Required Environment Variables for Railway:"
    Write-Host ""
    Write-Host "NODE_ENV=production"
    Write-Host "SECRET_KEY=your_super_secret_jwt_key_here_change_this"
    Write-Host "POSTGRES_PASSWORD=your_secure_password_here"
    Write-Host "REACT_APP_API_URL=https://your-backend-url.railway.app/api"
    Write-Host "REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app"
    Write-Host ""
    Write-Warning "Replace the URLs with your actual Railway deployment URLs"
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "Choose deployment option:"
    Write-Host "1) Deploy directly from local code (CLI)"
    Write-Host "2) Deploy from GitHub (Recommended)"
    Write-Host "3) Manual upload to Railway"
    Write-Host "4) Show environment variables needed"
    Write-Host "5) Exit"
    Write-Host ""
    $choice = Read-Host "Enter your choice (1-5)"
    return $choice
}

# Main execution
function Main {
    Test-RailwayCLI
    
    do {
        $choice = Show-Menu
        switch ($choice) {
            "1" {
                Deploy-Local
                break
            }
            "2" {
                Deploy-GitHub
                break
            }
            "3" {
                Deploy-Manual
                break
            }
            "4" {
                Show-EnvVars
            }
            "5" {
                Write-Info "Goodbye! 🌱"
                exit 0
            }
            default {
                Write-Error "Invalid option. Please try again."
            }
        }
    } while ($choice -ne "5")
}

# Run main function
Main
