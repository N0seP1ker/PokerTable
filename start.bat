@echo off
title Poker Table - Starting...
color 0A

echo ========================================
echo    FRIENDLY POKER TABLE
echo ========================================
echo.
echo Starting backend and frontend...
echo.

REM Start backend in a new window
start "Poker Backend (Port 3001)" cmd /k "cd /d %~dp0backend && echo Starting Backend Server... && npm run dev"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Poker Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && echo Starting Frontend Server... && npm run dev"

REM Wait 5 seconds for frontend to start
timeout /t 5 /nobreak >nul

cls
echo ========================================
echo    FRIENDLY POKER TABLE - READY!
echo ========================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo.
echo ========================================
echo.
echo ^>^> COPY THIS LINK TO YOUR BROWSER:
echo.
echo    http://localhost:3000
echo.
echo ========================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo Press any key to open the app in your browser...
pause >nul

REM Open default browser
start http://localhost:3000

echo.
echo Browser opened! Enjoy playing poker!
echo.
echo Press any key to close this window...
pause >nul
