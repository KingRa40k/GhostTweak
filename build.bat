@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   👻 GhostTweak — Полная автономная сборка релиза
echo ============================================================
echo.

echo [1/3] Компиляция фронтенда React 19...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Ошибка сборки фронтенда.
    pause
    exit /b 1
)

echo.
echo [2/3] Сборка нативного бинарника с автономной упаковкой UI...
call npx tauri build --no-bundle
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Ошибка сборки Tauri.
    pause
    exit /b 1
)

echo.
echo [3/3] Обновление публичных дистрибутивов...
copy /Y "src-tauri\target\release\ghosttweak.exe" "website\public\downloads\GhostTweak_Portable.exe"
copy /Y "src-tauri\target\release\ghosttweak.exe" "website\public\downloads\GhostTweak_Setup_v1.0.0.exe"
if exist "website\out\downloads" (
    copy /Y "src-tauri\target\release\ghosttweak.exe" "website\out\downloads\GhostTweak_Portable.exe"
    copy /Y "src-tauri\target\release\ghosttweak.exe" "website\out\downloads\GhostTweak_Setup_v1.0.0.exe"
)

echo.
echo ============================================================
echo [УСПЕХ] Готовый автономный GhostTweak_Portable.exe собран!
echo Он работает на 100%% без localhost и без сторонних программ.
echo ============================================================
