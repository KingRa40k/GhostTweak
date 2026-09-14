@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title GhostTweak - Environment Setup & Dependencies Installer

echo ================================================================
echo          GhostTweak - Настройка окружения и установка
echo ================================================================
echo Этот скрипт проверит наличие необходимых инструментов для сборки
echo и установит недостающие зависимости (Node.js, Rust, npm).
echo ================================================================
echo.

:: 1. Проверка Node.js
echo [1/4] Проверка Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
    echo   [+] Node.js найден: !NODE_VER!
) else (
    echo   [-] Node.js НЕ установлен!
    echo   [?] Попытка установки через Windows Package Manager (winget)...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        echo   [!] Node.js установлен. Перезапустите консоль после завершения скрипта.
    ) else (
        echo   [x] winget не найден. Установите Node.js вручную с https://nodejs.org
    )
)
echo.

:: 2. Проверка Rust / Cargo
echo [2/4] Проверка компилятора Rust...
where cargo >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('cargo --version') do set RUST_VER=%%i
    echo   [+] Rust найден: !RUST_VER!
) else (
    echo   [-] Rust compiler НЕ установлен!
    echo   [?] Попытка установки Rustup через winget...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install -e --id Rustlang.Rustup --accept-package-agreements --accept-source-agreements
        echo   [!] Rustup установлен. Запустите 'rustup-init.exe' или перезапустите консоль.
    ) else (
        echo   [x] Установите Rust вручную с официального сайта: https://rustup.rs
    )
)
echo.

:: 3. Установка npm зависимостей приложения
echo [3/4] Установка NPM зависимостей (GhostTweak Desktop)...
if exist package.json (
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        echo   Установка пакетов в корне...
        call npm install
        echo   [+] Зависимости Desktop приложения успешно установлены!
    ) else (
        echo   [x] npm не найден в PATH. Убедитесь, что Node.js установлен.
    )
) else (
    echo   [-] package.json не найден в текущей папке.
)
echo.

:: 4. Установка npm зависимостей промо-сайта
echo [4/4] Установка NPM зависимостей промо-сайта (Next.js)...
if exist website\package.json (
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        echo   Установка пакетов в website/...
        cd website
        call npm install
        cd ..
        echo   [+] Зависимости сайта успешно установлены!
    )
) else (
    echo   [-] website\package.json не найден, пропускаем.
)
echo.

echo ================================================================
echo                    ПРОВЕРКА И НАСТРОЙКА ЗАВЕРШЕНА
echo ================================================================
echo Теперь вам доступны:
echo   - keygen.bat   : Генератор лицензионных ключей
echo   - build.bat    : Сборка и компиляция релиза GhostTweak_Portable.exe
echo   - run_dev.bat  : Запуск проекта в режиме реального времени
echo ================================================================
echo.
pause
