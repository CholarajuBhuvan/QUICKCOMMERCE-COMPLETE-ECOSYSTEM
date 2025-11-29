@echo off
echo ========================================
echo   QuickMart E-commerce Ecosystem
echo   Starting All Applications...
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo Starting all applications...
echo - Backend API: http://localhost:5000
echo - Customer App: http://localhost:3000
echo - Picker App: http://localhost:3001
echo - Rider App: http://localhost:3002
echo - Admin Dashboard: http://localhost:3003
echo.
echo Press Ctrl+C to stop all applications
echo ========================================
echo.

npm run dev

pause
