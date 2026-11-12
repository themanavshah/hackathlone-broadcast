@echo off
rem Sets up OBS for HackAthlone 2026. Close OBS first.
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js first: https://nodejs.org & pause & exit /b 1)
node obs\setup-obs.mjs --install
echo.
echo Done. Press any key to close.
pause >nul
