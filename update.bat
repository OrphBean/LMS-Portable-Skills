@echo off
setlocal EnableExtensions
cd /d "%~dp0"

REM ============================================================
REM  update.bat - update the portable LM Studio app + re-verify
REM  Follows the AGENTS.md update protocol (stop, verify, backup,
REM  install, re-verify). Safe to re-run; preserves existing data.
REM ============================================================

title LM Studio portable - update

echo ============================================================
echo   LM Studio portable - update
echo   Root : %~dp0
echo ============================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Update-LM-Studio.ps1"

if errorlevel 1 (
    echo.
    echo   WARNING: update did not fully complete - read the messages above.
)

echo.
pause
endlocal
exit /b 0
