# Croppa Build Script
# This script builds both the Python backend and the Electron frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Croppa Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Python dependencies
Write-Host "[1/3] Installing Python dependencies..." -ForegroundColor Yellow
Set-Location "..\backend"
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Build backend executable
Write-Host "[2/3] Building backend executable..." -ForegroundColor Yellow
python build_backend.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build backend executable" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend executable built" -ForegroundColor Green
Write-Host ""

# Step 3: Build Electron app
Write-Host "[3/3] Building Electron app..." -ForegroundColor Yellow
Set-Location "..\frontend"
npm run electron:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Electron app" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Electron app built" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installer location:" -ForegroundColor Yellow
Write-Host "  .\dist-electron\Croppa Setup 1.0.0.exe" -ForegroundColor White
