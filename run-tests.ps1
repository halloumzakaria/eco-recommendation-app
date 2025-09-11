# Eco-Recommendation Test Runner (PowerShell)
Write-Host "🧪 Running Eco-Recommendation Test Suite" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Function to run tests
function Run-Tests {
    param(
        [string]$Service,
        [string]$TestDir,
        [string]$TestCommand
    )
    
    Write-Host "`nTesting $Service..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    Push-Location $TestDir
    
    try {
        Invoke-Expression $TestCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Service tests passed!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Service tests failed!" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error running $Service tests: $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# Track test results
$backendPassed = $false
$frontendPassed = $false

# Run Backend Tests
Write-Host "`nBackend Tests" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow

# Install backend dependencies if needed
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location "backend"
    npm install
    Pop-Location
}

# Run backend tests
if (Run-Tests "Backend" "backend" "npm test") {
    $backendPassed = $true
}

# Run Frontend Tests
Write-Host "`nFrontend Tests" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow

# Install frontend dependencies if needed
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location "frontend"
    npm install
    Pop-Location
}

# Run frontend tests
if (Run-Tests "Frontend" "frontend" "npm test -- --watchAll=false") {
    $frontendPassed = $true
}

# Summary
Write-Host "`nTest Summary" -ForegroundColor Yellow
Write-Host "============" -ForegroundColor Yellow

if ($backendPassed -and $frontendPassed) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} elseif ($backendPassed) {
    Write-Host "⚠️  Backend tests passed, Frontend tests failed" -ForegroundColor Yellow
    exit 1
} elseif ($frontendPassed) {
    Write-Host "⚠️  Frontend tests passed, Backend tests failed" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "❌ All tests failed!" -ForegroundColor Red
    exit 1
}
