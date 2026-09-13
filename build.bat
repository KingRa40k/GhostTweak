@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================================
echo   GhostTweak - Production Release Builder
echo ============================================================
echo.

rem Load environment variables from .env if present
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set "line=%%A"
        if not "!line:~0,1!"=="#" (
            set "%%A=%%B"
        )
    )
)

rem Configure MSVC OneCore Library path dynamically if available
set "ONECORE_PATH=C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Tools\MSVC\14.50.35717\lib\onecore\x64"
if not exist "!ONECORE_PATH!" (
    for /d %%V in ("C:\Program Files\Microsoft Visual Studio\*\*\VC\Tools\MSVC\*\lib\onecore\x64" "C:\Program Files (x86)\Microsoft Visual Studio\*\*\VC\Tools\MSVC\*\lib\onecore\x64") do (
        if exist "%%~fV" set "ONECORE_PATH=%%~fV"
    )
)
if exist "!ONECORE_PATH!" (
    if defined LIB (
        set "LIB=%LIB%;!ONECORE_PATH!"
    ) else (
        set "LIB=!ONECORE_PATH!"
    )
)

echo [1/4] Compiling React 19 frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed.
    exit /b 1
)

echo.
echo [2/4] Compiling Rust / Tauri v2 standalone native binary...
call npx tauri build --no-bundle
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Tauri compilation failed.
    exit /b 1
)

set "OUT_EXE=src-tauri\target\release\ghosttweak.exe"

echo.
echo [3/4] Checking Authenticode digital code signing...
if defined SIGNTOOL_KEY_PATH (
    if exist "%SIGNTOOL_KEY_PATH%" (
        echo [SIGNING] Certificate found: %SIGNTOOL_KEY_PATH%
        set "SIGNTOOL="
        where signtool >nul 2>nul
        if !ERRORLEVEL! equ 0 (
            set "SIGNTOOL=signtool"
        ) else (
            for /d %%D in ("C:\Program Files (x86)\Windows Kits\10\bin\10.*") do (
                if exist "%%D\x64\signtool.exe" set "SIGNTOOL=%%D\x64\signtool.exe"
            )
        )

        if defined SIGNTOOL (
            echo [SIGNING] Signing executable with !SIGNTOOL!...
            if defined SIGNTOOL_PASSWORD (
                call "!SIGNTOOL!" sign /f "%SIGNTOOL_KEY_PATH%" /p "%SIGNTOOL_PASSWORD%" /fd sha256 /tr http://timestamp.digicert.com /td sha256 "%OUT_EXE%"
            ) else (
                call "!SIGNTOOL!" sign /f "%SIGNTOOL_KEY_PATH%" /fd sha256 /tr http://timestamp.digicert.com /td sha256 "%OUT_EXE%"
            )
            if !ERRORLEVEL! equ 0 (
                echo [SUCCESS] Authenticode signature applied successfully.
            ) else (
                echo [WARNING] Signtool returned error code. Binary remains unsigned.
            )
        ) else (
            echo [WARNING] signtool.exe was not found on this system.
        )
    ) else (
        echo [WARNING] Certificate file not found at: %SIGNTOOL_KEY_PATH%
    )
) else (
    echo [INFO] Build mode: Unsigned Release.
    echo [INFO] To sign, configure SIGNTOOL_KEY_PATH and SIGNTOOL_PASSWORD in .env.
)

echo.
echo [4/4] Synchronizing distribution packages...
if not exist "website\public\downloads" mkdir "website\public\downloads"
copy /Y "%OUT_EXE%" "website\public\downloads\GhostTweak_Portable.exe" >nul
copy /Y "%OUT_EXE%" "website\public\downloads\GhostTweak_Setup_v1.0.0.exe" >nul
if not exist "releases" mkdir "releases"
copy /Y "%OUT_EXE%" "releases\GhostTweak_Portable.exe" >nul
copy /Y "%OUT_EXE%" "releases\GhostTweak_Setup_v1.0.0.exe" >nul
if exist "website\out\downloads" (
    copy /Y "%OUT_EXE%" "website\out\downloads\GhostTweak_Portable.exe" >nul
    copy /Y "%OUT_EXE%" "website\out\downloads\GhostTweak_Setup_v1.0.0.exe" >nul
)

echo.
echo ============================================================
echo   [SUCCESS] GhostTweak Release Built!
echo   Output: releases\GhostTweak_Portable.exe
for %%I in ("%OUT_EXE%") do echo   Binary size: %%~zI bytes
echo ============================================================
