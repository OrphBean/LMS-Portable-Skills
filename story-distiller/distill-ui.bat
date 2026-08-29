@echo off
rem Launch the Story Distiller HTML UI. Runs the server in the background so
rem closing this window does NOT stop long distillations.
setlocal EnableDelayedExpansion
cd /d "%~dp0"

if not exist "dist\main.js" (
    echo Building story-distiller first. This only needs to happen once.
    call npm run build
    if errorlevel 1 goto :buildfail
)

set "PORT=4180"
set "PIDFILE=distiller.%PORT%.pid"

rem Already running? Just open the browser and tell the user.
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if not errorlevel 1 (
    echo A Story Distiller server is ALREADY running on port %PORT%.
    echo The UI is at http://127.0.0.1:%PORT%  ^(opening it^).
    echo This window can be closed; the running server is not affected.
    start "" "http://127.0.0.1:%PORT%"
    timeout /t 4 /nobreak >nul
    exit /b 0
)

echo Starting Story Distiller server in the background...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Start-Process -FilePath 'node' -ArgumentList 'dist\main.js','--serve','--port','%PORT%' -WorkingDirectory '%cd%' -WindowStyle Hidden -PassThru; $p.Id | Out-File '%PIDFILE%' -Encoding ascii"
echo Server PID saved to %PIDFILE%.
echo Waiting for the server to come up...
timeout /t 4 /nobreak >nul

echo.
echo   Story Distiller UI:  http://127.0.0.1:%PORT%
echo   The server is running in the BACKGROUND - closing this window is fine.
echo   To stop it later, run:   stop-distiller.bat
echo.
start "" "http://127.0.0.1:%PORT%"
timeout /t 4 /nobreak >nul
exit /b 0

:buildfail
echo.
echo Build failed. Run "npm install" then "npm run build" in the story-distiller folder.
pause
exit /b 1
