@echo off
chcp 65001 >nul
title GhostTweak - Запуск приложения
echo ============================================================
echo   👻 GhostTweak — Запуск приложения оптимизации Windows
echo ============================================================
echo.

cd /d "%~dp0"

if exist "src-tauri\target\release\ghosttweak.exe" (
    echo [OK] Запускаем GhostTweak...
    start "" "src-tauri\target\release\ghosttweak.exe"
    exit
)

if exist "website\public\downloads\GhostTweak_Portable.exe" (
    echo [OK] Запускаем GhostTweak Portable...
    start "" "website\public\downloads\GhostTweak_Portable.exe"
    exit
)

echo [INFO] Исполняемый файл не найден. Выполняется автоматическая сборка...
call build.bat
if exist "src-tauri\target\release\ghosttweak.exe" (
    start "" "src-tauri\target\release\ghosttweak.exe"
)
