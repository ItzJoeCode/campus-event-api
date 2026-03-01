@echo off
REM CampusEvent API - Demo Script for Windows
REM This script helps you test the full application locally

echo 🎓 CampusEvent API - Demo Setup
echo =================================

REM Check if MongoDB is running locally
echo 📊 Checking MongoDB connection...
netstat -an | find "27017" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running locally
    set MONGODB_URI=mongodb://localhost:27017/campus_events
) else (
    echo ⚠️  MongoDB not running locally. Using MongoDB Atlas...
    REM You'll need to set this environment variable
    if "%MONGODB_URI%"=="" set MONGODB_URI=mongodb+srv://demo:demo@cluster.mongodb.net/campus_events
)

REM Set environment variables
set JWT_SECRET=demo_jwt_secret_change_in_production
set JWT_EXPIRE=7d
set NODE_ENV=development
set PORT=5000

echo 🔧 Environment configured:
echo    MONGODB_URI: %MONGODB_URI%
echo    JWT_SECRET: [HIDDEN]
echo    PORT: %PORT%

REM Seed the database
echo.
echo 🌱 Seeding database with demo data...
cd scripts
npx ts-node seedDatabase.ts
cd ..
if %errorlevel% neq 0 (
    echo ❌ Database seeding failed. Continuing anyway...
)

REM Start the backend server
echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

REM Start the frontend
echo.
echo 💻 Starting frontend...
cd frontend
start "Frontend Dev Server" cmd /c "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Demo is running!
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:5173
echo.
echo 📋 Test the following:
echo    1. Open http://localhost:5173 in your browser
echo    2. Register a new account
echo    3. Login with your credentials
echo    4. Browse available events
echo    5. Purchase tickets for an event
echo    6. Check your dashboard
echo.
echo 🛑 Close the command windows to stop the demo
echo.
echo Press any key to exit this script...
pause >nul