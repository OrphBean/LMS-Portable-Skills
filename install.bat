@echo off
setlocal EnableExtensions
cd /d "%~dp0"

REM ============================================================
REM  install.bat - set up the portable LM Studio install
REM  Runs on its own from this repo/copy. Safe to re-run.
REM ============================================================

title LM Studio portable - setup
set "ROOT=%~dp0"
set "EXE=%ROOT%App\LM Studio\LM Studio.exe"

echo ============================================================
echo   LM Studio portable setup
echo   Root : %ROOT%
echo ============================================================
echo.

echo [1/4] Creating folder structure...
if not exist "App\LM Studio"         mkdir "App\LM Studio"
if not exist "Data\dot-lmstudio"     mkdir "Data\dot-lmstudio"
if not exist "Data\cache-lm-studio"  mkdir "Data\cache-lm-studio"
if not exist "Data\electron-profile" mkdir "Data\electron-profile"
if not exist ".agents\skills"        mkdir ".agents\skills"
if not exist "Backups"               mkdir "Backups"
if not exist "Models"                mkdir "Models"
echo   done.
echo.

echo [2/4] Checking the LM Studio app...
if exist "%EXE%" (
    echo   Found: %EXE%
) else (
    call :locate_app
)
echo.

if exist "%EXE%" (
    echo [3/4] Setting up portable profile + skills plugin...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%ROOT%Install-Portable.ps1"
    if errorlevel 1 (
        echo   WARNING: setup reported an issue - read the messages above.
    )
    echo.
    echo [4/4] Finished.
    echo.
    echo   Launch LM Studio with: Launch-LM-Studio.bat
    echo   First time only: in LM Studio set the models folder to:
    echo     %ROOT%Models
) else (
    echo [3/4] SKIPPED - no LM Studio app found.
    echo.
    echo   ------------------------------------------------------------------
    echo     Download the LM Studio installer from:
    echo       https://lmstudio.ai/download
    echo     Then either:
    echo       1. run the installer and choose this folder as its location:
    echo            %ROOT%App\LM Studio
    echo       2. install LM Studio normally, then re-run this bat - it will
    echo          copy the app into App\LM Studio automatically, or
    echo       3. copy the LM Studio program files here yourself so that
    echo            %EXE%
    echo          exists.
    echo     Then re-run: install.bat
    echo   ------------------------------------------------------------------
)
echo.

pause
endlocal
exit /b 0

:locate_app
rem Try known LM Studio per-user install locations.
for %%C in (
    "%LOCALAPPDATA%\Programs\LM Studio"
    "%LOCALAPPDATA%\LM Studio"
) do (
    if exist "%%~C\LM Studio.exe" (
        echo   Copying LM Studio from %%~C ...
        robocopy "%%~C" "%ROOT%App\LM Studio" /E /NFL /NDL /NJH /NJS /NP >nul
        if errorlevel 8 (
            echo   WARNING: could not copy from %%~C .
        ) else (
            echo   Copied LM Studio into App\LM Studio.
        )
        exit /b 0
    )
)
echo   Could not find LM Studio.exe in App\LM Studio or your install folder.
exit /b 0
