# Docker Hub Build and Push Script (PowerShell)
Write-Host "🐳 Building and pushing Eco Recommendation app to Docker Hub..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Get Docker Hub username
$DOCKERHUB_USERNAME = Read-Host "Enter your Docker Hub username"

if ([string]::IsNullOrEmpty($DOCKERHUB_USERNAME)) {
    Write-Host "❌ Docker Hub username is required" -ForegroundColor Red
    exit 1
}

# Set image name
$IMAGE_NAME = "$DOCKERHUB_USERNAME/eco-recommendation:latest"

Write-Host "📦 Building Docker image: $IMAGE_NAME" -ForegroundColor Yellow

# Build the image
docker build -f Dockerfile.dockerhub -t $IMAGE_NAME .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔐 Logging into Docker Hub..." -ForegroundColor Yellow
docker login

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logged into Docker Hub" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Hub login failed" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Pushing image to Docker Hub..." -ForegroundColor Yellow
docker push $IMAGE_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image pushed to Docker Hub successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://railway.app" -ForegroundColor White
    Write-Host "2. Create new project" -ForegroundColor White
    Write-Host "3. Deploy from Docker Hub" -ForegroundColor White
    Write-Host "4. Use image: $IMAGE_NAME" -ForegroundColor White
    Write-Host "5. Add PostgreSQL database" -ForegroundColor White
    Write-Host "6. Set environment variables" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See DOCKER-HUB-DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to push image to Docker Hub" -ForegroundColor Red
    exit 1
}
