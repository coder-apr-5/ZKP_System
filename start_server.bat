@echo off
echo Starting PrivaSeal Backend on http://localhost:8000...
start cmd /k "call .venv\Scripts\activate && cd backend && uvicorn app.main:app --reload --port 8000"
timeout /t 3
echo Starting PrivaSeal Frontend on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"
echo PrivaSeal System Started!
pause
