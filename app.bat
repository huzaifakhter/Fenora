@echo off
cls
color 0A

REM =========================================
REM         FILE SERVER STARTUP SCRIPT
REM =========================================

:: Display banner
echo.
echo ===============================================================================
echo      Welcome to the FENORA (Files Exchange Network & Office Resource App
echo ===============================================================================
echo.

:: Create required folders
if not exist data mkdir data
if not exist uploads mkdir uploads

:: Sync uv before starting
echo [~] Syncing uv...
call uv sync
if %errorlevel% neq 0 (
    echo [✖] Failed to sync uv. Exiting...
    pause
    exit /b
)
echo [✔] uv synced successfully!
echo.

:: Detect LAN IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do set ip=%%a
set ip=%ip:~1%

set PORT=8000

:: Display connection info
echo ================= CONNECTION INFO ================================================================
echo Host LAN IP:     %ip%
echo Server Port:    %PORT%

:: Highlight Access Link in cyan
powershell -Command "Write-Host 'Access Link: http://%ip%:%PORT% - Share This Link With Your Teammates On The Same Network' -ForegroundColor Cyan"

echo ==================================================================================================
echo.

:: Start Uvicorn server
echo [→] Starting Uvicorn server...
call uv run uvicorn main:app --host 0.0.0.0 --port %PORT%
echo.
pause
