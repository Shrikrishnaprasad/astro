@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  msg %username% "npm was not found. Install Node.js, then run npm install in the Astro folder."
  exit /b 1
)

if not exist "node_modules\" (
  start "Astro - npm install" cmd /k "cd /d \"%CD%\" && npm install && pause"
  exit /b 0
)

npm run app
