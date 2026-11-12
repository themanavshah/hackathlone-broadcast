@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js first: https://nodejs.org & pause & exit /b 1)
echo HackAthlone Broadcast - http://127.0.0.1:3131
echo Keep this window open while you stream.
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:3131"
node server.mjs
pause
