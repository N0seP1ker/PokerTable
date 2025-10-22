# Friendly Poker Table Startup Script
# PowerShell version for Windows

$Host.UI.RawUI.WindowTitle = "Poker Table - Starting..."

# Clear screen and show header
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🃏  FRIENDLY POKER TABLE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend in new window
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal

# Wait for backend to initialize
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
$frontendPath = Join-Path $scriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal

# Wait for frontend to start
Write-Host "   Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Display success message
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅ SERVERS ARE RUNNING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3001" -ForegroundColor Green
Write-Host "  Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  >> COPY THIS LINK TO YOUR BROWSER:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both servers are running in separate windows." -ForegroundColor Gray
Write-Host "Close those windows to stop the servers." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to open the app in your browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Browser opened! Enjoy playing poker! 🃏" -ForegroundColor Green
Write-Host ""
Write-Host "You can close this window now." -ForegroundColor Gray
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
