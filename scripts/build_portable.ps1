$projDir = Split-Path -Parent $PSScriptRoot;
$candidates = @(
    "$env:LOCALAPPDATA\electron-builder\Cache\nsis\nsis-3.0.4.1\makensis.exe",
    "C:\Program Files (x86)\NSIS\makensis.exe",
    "C:\Program Files\NSIS\makensis.exe"
);
$nsisExe = $null;
foreach ($c in $candidates) {
    if (Test-Path $c) { $nsisExe = $c; break; }
}
if (-not $nsisExe) {
    $cmd = Get-Command makensis.exe -ErrorAction SilentlyContinue;
    if ($cmd) { $nsisExe = $cmd.Source; }
}

if (-not $nsisExe) {
    Write-Error "makensis.exe not found in PATH or standard directories.";
    exit 1;
}

$nsisScript = @"
Unicode true
RequestExecutionLevel user
SilentInstall silent
AutoCloseWindow true
ShowInstDetails nevershow

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "GhostTweak Portable"
VIAddVersionKey "CompanyName" "GhostTweak"
VIAddVersionKey "FileDescription" "GhostTweak Gaming Optimizer Portable"
VIAddVersionKey "FileVersion" "1.0.0.0"

OutFile "$projDir\website\public\downloads\GhostTweak_Beta_Portable.exe"
Icon "$projDir\src-tauri\icons\icon.ico"

Section
  SetOutPath "`$LOCALAPPDATA\GhostTweak\app"
  File "$projDir\src-tauri\target\release\ghosttweak.exe"
  File "$projDir\src-tauri\target\release\WebView2Loader.dll"
  Exec '"`$LOCALAPPDATA\GhostTweak\app\ghosttweak.exe"'
SectionEnd
"@;

$tempNsi = "$env:TEMP\build_ghost_portable.nsi";
$nsisScript | Set-Content -Path $tempNsi -Encoding utf8;
& $nsisExe $tempNsi;
Remove-Item $tempNsi -Force -ErrorAction SilentlyContinue;

Copy-Item -Path "$projDir\website\public\downloads\GhostTweak_Beta_Portable.exe" -Destination "$projDir\website\public\downloads\GhostTweak_Portable.exe" -Force;
Copy-Item -Path "$projDir\website\public\downloads\GhostTweak_Beta_Portable.exe" -Destination "$projDir\website\public\downloads\GhostTweak_Latest.exe" -Force;
if (Test-Path "$projDir\releases") {
    Copy-Item -Path "$projDir\website\public\downloads\GhostTweak_Beta_Portable.exe" -Destination "$projDir\releases\GhostTweak_Portable.exe" -Force;
}

Write-Host "Portable build packaged successfully!";

