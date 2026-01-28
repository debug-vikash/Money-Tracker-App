@echo off
title Money Tracker App
echo ========================================
echo    Money Tracker Application
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

:: Start Backend (Spring Boot) in a new window
echo [1/2] Starting Backend Server...
start "Money Tracker Backend" cmd /k "cd /d %~dp0 && call mvnw.cmd spring-boot:run"

:: Wait a moment for backend to start initializing
timeout /t 5 /nobreak > nul

:: Start Frontend (Vite) in a new window
echo [2/2] Starting Frontend Server...
start "Money Tracker Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo.
echo Close this window and the terminal
echo windows to stop both servers.
echo ========================================
pause
