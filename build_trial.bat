@echo off
title Build GhostTweak 24-Hour Trial
echo ========================================================
echo  GhostTweak - Building 24-Hour Evaluation Trial Binary
echo ========================================================
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %ERRORLEVEL%
)

cd src-tauri
call cargo build --release --features trial
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cargo release build failed!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

copy /y src-tauri\target\release\ghosttweak.exe GhostTweak_24h_Trial.exe
echo.
echo ========================================================
echo  SUCCESS! Generated: GhostTweak_24h_Trial.exe
echo  Ready to send to prospective buyers for testing.
echo ========================================================
pause
