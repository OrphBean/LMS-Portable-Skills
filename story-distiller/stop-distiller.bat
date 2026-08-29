@echo off
rem Stop the background Story Distiller server launched by distill-ui.bat.
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "PORT=4180"
set "PIDFILE=distiller.%PORT%.pid"

if exist "%PIDFILE%" (
    set /p PID=<"%PIDFILE%"
    taskkill /pid %PID% /f >nul 2>&1
    del "%PIDFILE%" >nul 2>&1
    echo Stopped Story Distiller server (PID %PID%).
) else (
    echo No Story Distiller server PID file found.
    echo If one is running, close its window or choose the process in Task Manager.
)
pause
