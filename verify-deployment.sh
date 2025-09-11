#!/bin/bash

# Railway Deployment Verification Script
echo "🚀 Verifying Railway Deployment Configuration..."

# Check if required files exist
echo "📁 Checking required files..."

files=(
    "Dockerfile.railway"
    "railway.json"
    "railway.toml"
    "env.railway.template"
    "backend/package.json"
    "frontend/package.json"
    "backend/nlp_api/requirements.txt"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check Dockerfile.railway syntax
echo "🐳 Checking Dockerfile.railway..."
if docker build --dry-run -f Dockerfile.railway . > /dev/null 2>&1; then
    echo "✅ Dockerfile.railway syntax is valid"
else
    echo "❌ Dockerfile.railway has syntax errors"
    echo "Run: docker build -f Dockerfile.railway . to see detailed errors"
fi

# Check if backend has proper start script
echo "🔧 Checking backend configuration..."
if grep -q "npm start" backend/package.json; then
    echo "✅ Backend has start script"
else
    echo "❌ Backend missing start script"
fi

# Check if frontend builds
echo "⚛️ Checking frontend build..."
if [ -d "frontend" ]; then
    cd frontend
    if npm list > /dev/null 2>&1; then
        echo "✅ Frontend dependencies are installed"
    else
        echo "⚠️ Frontend dependencies not installed (run npm install)"
    fi
    cd ..
fi

# Check NLP API requirements
echo "🐍 Checking NLP API..."
if [ -f "backend/nlp_api/requirements.txt" ]; then
    echo "✅ NLP API requirements file exists"
else
    echo "❌ NLP API requirements file missing"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project"
echo "3. Deploy from GitLab repository"
echo "4. Add PostgreSQL database"
echo "5. Set environment variables"
echo "6. Test your deployment!"
echo ""
echo "📖 See RAILWAY-DEPLOYMENT-GUIDE.md for detailed instructions"

