# Reddit-style UI Deployment Script for Windows
Write-Host "====== STARTING DEPLOYMENT PROCESS ======" -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Step 1: Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm install

# Step 2: Build the frontend
Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location -Path frontend
npm install
npm run build
Set-Location -Path ..

# Step 3: Verify build
Write-Host "Verifying build..." -ForegroundColor Cyan
if (Test-Path -Path "./public/index.html") {
  Write-Host "✅ Build successful - index.html exists in public folder" -ForegroundColor Green
} else {
  Write-Host "❌ Build failed - index.html not found in public folder" -ForegroundColor Red
  exit 1
}

# Step 4: Create a version file for cache busting
Write-Host "Creating version file..." -ForegroundColor Cyan
$version = @{
  version = "1.2.0-reddit-ui"
  buildTime = (Get-Date).ToUniversalTime().ToString("o")
}
$version | ConvertTo-Json | Set-Content -Path "./public/version.json"

Write-Host "====== DEPLOYMENT PREPARATION COMPLETE ======" -ForegroundColor Green
Write-Host "To complete deployment:" -ForegroundColor Yellow
Write-Host "1. Commit these changes: git add . && git commit -m 'Reddit UI update with deployment fixes'" -ForegroundColor Yellow
Write-Host "2. Push to GitHub: git push" -ForegroundColor Yellow
Write-Host "3. Deploy will automatically trigger on Render" -ForegroundColor Yellow
