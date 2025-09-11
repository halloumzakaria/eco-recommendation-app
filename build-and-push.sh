#!/bin/bash

# Docker Hub Build and Push Script
echo "🐳 Building and pushing Eco Recommendation app to Docker Hub..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Get Docker Hub username
read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME

if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ Docker Hub username is required"
    exit 1
fi

echo "🔍 Using Docker Hub username: $DOCKERHUB_USERNAME"

# Set image name
IMAGE_NAME="$DOCKERHUB_USERNAME/eco-recommendation:latest"

echo "📦 Building Docker image: $IMAGE_NAME"

# Build the image
docker build -f Dockerfile.dockerhub -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo "🔐 Logging into Docker Hub..."
docker login

if [ $? -eq 0 ]; then
    echo "✅ Logged into Docker Hub"
else
    echo "❌ Docker Hub login failed"
    exit 1
fi

echo "📤 Pushing image to Docker Hub..."
docker push $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Image pushed to Docker Hub successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://railway.app"
    echo "2. Create new project"
    echo "3. Deploy from Docker Hub"
    echo "4. Use image: $IMAGE_NAME"
    echo "5. Add PostgreSQL database"
    echo "6. Set environment variables"
    echo ""
    echo "📖 See DOCKER-HUB-DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Failed to push image to Docker Hub"
    exit 1
fi
