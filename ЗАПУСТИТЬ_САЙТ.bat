@echo off
chcp 65001 >nul
title GhostTweak - Запуск веб-сайта
echo ============================================================
echo   👻 GhostTweak — Запуск официального сайта (Landing Page)
echo ============================================================
echo.

cd /d "%~dp0website"

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js обнаружен. Запускаем сервер сайта...
    node serve.mjs
    goto :end
)

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Python обнаружен. Запускаем легковесный HTTP-сервер...
    start "" http://localhost:3000
    python -m http.server 3000 --directory out
    goto :end
)

echo [ВНИМАНИЕ] Не найден Node.js или Python.
echo Открываем готовую оффлайн-версию в браузере...
start "" "%~dp0website\out\index.html"

:end
pause
