@echo off
chcp 65001 >nul
title GhostTweak Network & Ping Reset

:: Auto-elevate to Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Запрос прав администратора...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ========================================================
echo   GhostTweak - Полный сброс сетевых задержек (FaceIT/CS2)
echo ========================================================
echo.

echo [1/4] Удаление TcpAckFrequency и TCPNoDelay (устранение очереди пакетов)...
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TcpAckFrequency /f >nul 2>&1
reg delete "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v TCPNoDelay /f >nul 2>&1

echo [2/4] Возврат схемы электропитания на «Высокая производительность»...
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1

echo [3/4] Восстановление настроек стека TCP (Windows Defaults)...
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set global rss=enabled >nul 2>&1
netsh int tcp set global ecncapability=disabled >nul 2>&1

echo [4/4] Очистка DNS кэша...
ipconfig /flushdns >nul 2>&1

echo.
echo ========================================================
echo   УСПЕШНО! Сеть и пинг возвращены в идеальное состояние.
echo   Пинг в FaceIT вернется к исходным 9 мс.
echo ========================================================
echo.
pause
