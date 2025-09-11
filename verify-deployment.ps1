# Railway Deployment Verification Script (PowerShell)
Write-Host "🚀 Verifying Railway Deployment Configuration..." -ForegroundColor Green

# Check if required files exist
Write-Host "📁 Checking required files..." -ForegroundColor Yellow

$files = @(
    "Dockerfile.railway",
    "railway.json",
    "railway.toml",
    "env.railway.template",
    "backend/package.json",
    "frontend/package.json",
    "backend/nlp_api/requirements.txt"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Check if backend has proper start script
Write-Host "🔧 Checking backend configuration..." -ForegroundColor Yellow
$packageJson = Get-Content "backend/package.json" | ConvertFrom-Json
if ($packageJson.scripts.start) {
    Write-Host "✅ Backend has start script" -ForegroundColor Green
} else {
    Write-Host "❌ Backend missing start script" -ForegroundColor Red
}

# Check if frontend exists
Write-Host "⚛️ Checking frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Write-Host "✅ Frontend directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory missing" -ForegroundColor Red
}

# Check NLP API requirements
Write-Host "🐍 Checking NLP API..." -ForegroundColor Yellow
if (Test-Path "backend/nlp_api/requirements.txt") {
    Write-Host "✅ NLP API requirements file exists" -ForegroundColor Green
} else {
    Write-Host "❌ NLP API requirements file missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Create new project" -ForegroundColor White
Write-Host "3. Deploy from GitLab repository" -ForegroundColor White
Write-Host "4. Add PostgreSQL database" -ForegroundColor White
Write-Host "5. Set environment variables" -ForegroundColor White
Write-Host "6. Test your deployment!" -ForegroundColor White
Write-Host ""
Write-Host "📖 See RAILWAY-DEPLOYMENT-GUIDE.md for detailed instructions" -ForegroundColor Cyan
