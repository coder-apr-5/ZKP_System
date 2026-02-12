@echo off
cd backend
py -m venv venv
call venv\Scripts\activate
python -m pip install -r requirements.txt
echo Backend dependencies installed.
pause
