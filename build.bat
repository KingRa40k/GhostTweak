@echo off
setlocal
cd /d "%~dp0src-tauri"
cargo build --release
if %ERRORLEVEL% equ 0 (
    echo [OK] GhostTweak built successfully.
) else (
    echo [ERROR] Build failed. Ensure Rust and MSVC Build Tools are installed.
)
