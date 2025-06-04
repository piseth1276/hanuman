@echo off
echo Starting Student Management System...
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

REM Check if npm is available
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not available
    echo Please reinstall Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

REM Navigate to server directory
cd /d "%~dp0server"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Start the server
echo Starting server on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
npm start

pause
