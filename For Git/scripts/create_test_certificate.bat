@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
cd ..

echo ============================================================
echo   GhostTweak - Test Code Signing Certificate Generator
echo ============================================================
echo.
echo Generating local self-signed Authenticode test certificate...
echo.

set "CERT_DIR=scripts"
set "CERT_PATH=%CERT_DIR%\test_cert.pfx"
set "CERT_PASS=ghosttweak"

if not exist "%CERT_DIR%" mkdir "%CERT_DIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=GhostTweak Test Software, O=GhostTweak Development' -KeyAlgorithm RSA -KeyLength 2048 -CertStoreLocation 'Cert:\CurrentUser\My' -NotAfter (Get-Date).AddYears(5); $pwd = ConvertTo-SecureString -String '%CERT_PASS%' -Force -AsPlainText; Export-PfxCertificate -Cert $cert -FilePath '%CERT_PATH%' -Password $pwd | Out-Null; Write-Host '[SUCCESS] Certificate file generated: %CERT_PATH%'"

if not exist "%CERT_PATH%" (
    echo [ERROR] Failed to generate test certificate.
    exit /b 1
)

echo.
echo Updating .env configuration...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$envFile = '.env'; if (Test-Path $envFile) { $lines = Get-Content $envFile | Where-Object { $_ -notmatch 'SIGNTOOL_KEY_PATH' -and $_ -notmatch 'SIGNTOOL_PASSWORD' }; $lines += 'SIGNTOOL_KEY_PATH=scripts\test_cert.pfx'; $lines += 'SIGNTOOL_PASSWORD=%CERT_PASS%'; Set-Content -Path $envFile -Value $lines; Write-Host '[OK] .env updated successfully.' }"

echo.
echo ============================================================
echo   Test Certificate Ready!
echo   Location: %CERT_PATH%
echo   Password: %CERT_PASS%
echo.
echo   Configured in .env:
echo     SIGNTOOL_KEY_PATH=scripts\test_cert.pfx
echo     SIGNTOOL_PASSWORD=%CERT_PASS%
echo.
echo   You can now run build.bat to produce signed executables.
echo ============================================================
echo.
