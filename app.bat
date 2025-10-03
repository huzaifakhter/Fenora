@echo off
cls
color 0A

REM Get LAN IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do set ip=%%a
set ip=%ip:~1%

set PORT=8000
echo Host LAN IP detected: %ip%
echo Server will run on port: %PORT%
echo Access from other devices: http://%ip%:%PORT%
echo.

call uv run uvicorn main:app --host 0.0.0.0 --port %PORT%
pause
