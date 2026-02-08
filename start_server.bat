@echo off
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"
start cmd /k "cd frontend && npm run dev"
echo Servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause
