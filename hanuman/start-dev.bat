@echo off
echo Starting Student Management System in Development Mode...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Navigate to server directory
cd /d "%~dp0server"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server in development mode with auto-restart
echo Starting development server with auto-restart...
echo Server will be available at http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause
