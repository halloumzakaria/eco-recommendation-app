# GitHub Deployment Script for Eco-Recommendation App (PowerShell)
Write-Host "🚀 Deploying Eco-Recommendation App to GitHub" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

Write-Host "`nStep 1: Remove old GitHub remote" -ForegroundColor Yellow
git remote remove github

Write-Host "`nStep 2: Add new GitHub remote" -ForegroundColor Yellow
Write-Host "Please replace 'YOUR_USERNAME' with your actual GitHub username:" -ForegroundColor Cyan
Write-Host "git remote add github https://github.com/YOUR_USERNAME/eco-recommendation-app.git" -ForegroundColor White

Write-Host "`nStep 3: Push to GitHub" -ForegroundColor Yellow
Write-Host "git push -u github master" -ForegroundColor White

Write-Host "`n✅ Repository is ready for GitHub deployment!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub.com" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run: git remote add github YOUR_REPO_URL" -ForegroundColor White
Write-Host "4. Run: git push -u github master" -ForegroundColor White
Write-Host "5. Your app will be available on GitHub!" -ForegroundColor White
