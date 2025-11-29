@echo off
echo ========================================
echo   QuickMart E-commerce Ecosystem
echo   Installing All Dependencies...
echo ========================================
echo.

echo Step 1/6: Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies!
    pause
    exit /b 1
)
echo ✅ Root dependencies installed
echo.

echo Step 2/6: Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies!
    pause
    exit /b 1
)
cd ..
echo ✅ Server dependencies installed
echo.

echo Step 3/6: Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies!
    pause
    exit /b 1
)
cd ..
echo ✅ Client dependencies installed
echo.

echo Step 4/6: Installing picker-app dependencies...
cd picker-app
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install picker-app dependencies!
    pause
    exit /b 1
)
cd ..
echo ✅ Picker-app dependencies installed
echo.

echo Step 5/6: Installing rider-app dependencies...
cd rider-app
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install rider-app dependencies!
    pause
    exit /b 1
)
cd ..
echo ✅ Rider-app dependencies installed
echo.

echo Step 6/6: Installing admin-dashboard dependencies...
cd admin-dashboard
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install admin-dashboard dependencies!
    pause
    exit /b 1
)
cd ..
echo ✅ Admin-dashboard dependencies installed
echo.

echo ========================================
echo   ✅ ALL DEPENDENCIES INSTALLED!
echo ========================================
echo.
echo Next steps:
echo 1. Create admin user: cd server ^&^& node create-admin.js
echo 2. Start all apps: npm run dev
echo    OR double-click START.bat
echo.
pause
