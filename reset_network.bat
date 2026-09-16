@echo off
title GhostTweak Network Reset
echo ========================================================
echo  GhostTweak - Safe Network Settings Restoration
echo ========================================================
echo.
echo Removing aggressive TCP packet flooding tweaks...
reg delete " HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\ /v TcpAckFrequency /f 2>nul
reg delete \HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\ /v TCPNoDelay /f 2>nul

echo Resetting TCP autotuning and RSS to stable Windows defaults...
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global rss=enabled
netsh int tcp set global ecncapability=disabled

echo Flushing DNS cache...
ipconfig /flushdns

echo.
echo ========================================================
echo SUCCESS! Network stack has been restored to clean stock.
echo Recommended: Restart your PC or reconnect your Wi-Fi/LAN.
echo ========================================================
echo.
pause
