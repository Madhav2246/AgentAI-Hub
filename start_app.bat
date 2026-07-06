@echo off
title AgentHub AI Launcher
echo ========================================================
echo               AgentHub AI Launcher
echo     "The Operating System for AI Employees"
echo ========================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is not detected. Please install Node.js (v18+) to run the frontend.
) else (
    echo [OK] Node.js is installed.
)

:: Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Python is not detected. Please install Python (v3.9+) to run the backend.
) else (
    echo [OK] Python is installed.
)
echo.

:: Setup backend
echo --- Setting up Python Backend ---
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment and installing requirements...
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r ..\requirements.txt
cd ..
echo.

:: Setup frontend
echo --- Setting up Frontend ---
cd frontend
if not exist node_modules (
    echo Installing npm dependencies (this may take a minute)...
    call npm install
)
cd ..
echo.

echo ========================================================
echo Starting Frontend (Vite) and Backend (FastAPI) Concurrently...
echo.
echo - Frontend will run on: http://localhost:5173
echo - Backend will run on:  http://localhost:8000
echo ========================================================
echo.

start cmd /k "echo Starting Backend... && cd backend && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"
start cmd /k "echo Starting Frontend... && cd frontend && npm run dev"

echo.
echo Both servers have been launched in separate terminal windows.
echo Press any key to exit this launcher window...
pause > nul
