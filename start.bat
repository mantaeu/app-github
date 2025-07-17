@echo off
echo.
echo ========================================
echo   MANTAEVERT APP - QUICK START
echo ========================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Seeding database with sample data...
call npm run seed
if %errorlevel% neq 0 (
    echo WARNING: Database seeding failed (this is OK if already seeded)
)

echo.
echo [4/4] Starting backend server...
start "Mantaevert Backend" cmd /k "npm run dev"

echo.
echo Backend server started in new window...
echo Waiting 5 seconds for server to initialize...
timeout /t 5 /nobreak > nul

cd ..
echo.
echo Starting frontend app...
echo.
echo ========================================
echo   LOGIN CREDENTIALS:
echo ========================================
echo   Admin: admin@mantaevert.com / admin123
echo   Worker: john.doe@mantaevert.com / worker123
echo ========================================
echo.

call npm start