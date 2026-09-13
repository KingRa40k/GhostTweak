@echo off
chcp 65001 >nul
cd /d "%~dp0"
title GhostTweak - Меню управления лицензиями

:MENU
cls
echo ============================================================
echo   GhostTweak - Панель Генерации Лицензионных Ключей
echo ============================================================
echo.
echo   [1] Создать 1 бессрочный PRO-ключ (VIP Lifetime)
echo   [2] Создать 1 ключ на 30 дней (Monthly Pass)
echo   [3] Создать 1 ключ на 24 часа (Day Pass)
echo   [4] Сгенерировать пачку из 50 ключей в файл keys.txt (для магазина)
echo   [5] Запустить локальный сервер лицензий и базу данных
echo   [6] Показать список выданных лицензий в базе SQLite
echo   [0] Выход
echo.
echo ============================================================
set /p CHOICE="Выберите действие [0-6]: "

if "%CHOICE%"=="1" goto GEN_LIFETIME
if "%CHOICE%"=="2" goto GEN_MONTHLY
if "%CHOICE%"=="3" goto GEN_DAY
if "%CHOICE%"=="4" goto GEN_BATCH
if "%CHOICE%"=="5" goto RUN_SERVER
if "%CHOICE%"=="6" goto LIST_DB
if "%CHOICE%"=="0" exit /b 0
goto MENU

:GEN_LIFETIME
echo.
set /p USERNAME="Имя покупателя или никнейм [Enter для Ghost VIP User]: "
if "%USERNAME%"=="" set USERNAME=Ghost VIP User
echo.
python tools\license_generator.py --sub "%USERNAME%" --type lifetime
echo.
pause
goto MENU

:GEN_MONTHLY
echo.
set /p USERNAME="Имя покупателя или никнейм [Enter для Ghost User]: "
if "%USERNAME%"=="" set USERNAME=Ghost User
echo.
python tools\license_generator.py --sub "%USERNAME%" --type monthly
echo.
pause
goto MENU

:GEN_DAY
echo.
set /p USERNAME="Имя покупателя или никнейм [Enter для Esports Player]: "
if "%USERNAME%"=="" set USERNAME=Esports Player
echo.
python tools\license_generator.py --sub "%USERNAME%" --type day
echo.
pause
goto MENU

:GEN_BATCH
echo.
set /p BATCH_COUNT="Количество ключей [по умолчанию 50]: "
if "%BATCH_COUNT%"=="" set BATCH_COUNT=50
echo.
python tools\license_generator.py --type lifetime --count %BATCH_COUNT% --output keys.txt
echo.
echo Файл keys.txt успешно создан в корне проекта!
echo.
pause
goto MENU

:RUN_SERVER
cls
echo ============================================================
echo   Запуск GhostTweak License Server (FastAPI / SQLite)
echo ============================================================
echo Сервер будет доступен по адресу: http://127.0.0.1:8080
echo Нажмите Ctrl+C для остановки.
echo.
python tools\license_server.py --port 8080
pause
goto MENU

:LIST_DB
echo.
python tools\license_server.py --list
echo.
pause
goto MENU
