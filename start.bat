@echo off
echo ========================================
echo Starting League Cards Game Servers
echo ========================================
echo.

REM Start the backend server in a new window
echo Starting backend server...
start "League Cards - Backend Server" cmd /k "cd server && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 2 /nobreak >nul

REM Start the frontend client in a new window
echo Starting frontend client...
start "League Cards - Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: Will be shown in the client window
echo.
echo Close this window or press any key to exit...
pause >nul
