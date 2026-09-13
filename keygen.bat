@echo off
title GhostTweak - License Key Generator
cd /d "%~dp0"

echo Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

node scripts\keygen.mjs

echo.
pause
