$dest = "temp_buyer_kit"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Path $dest | Out-Null
New-Item -ItemType Directory -Path (Join-Path $dest "scripts") | Out-Null

Copy-Item "releases\GhostTweak_Portable.exe" $dest
Copy-Item "keygen.bat" $dest
Copy-Item "setup_env.bat" $dest
Copy-Item "OWNER_GUIDE.html" $dest
Copy-Item "HANDOVER_GUIDE.md" $dest
Copy-Item "scripts\keygen.mjs" (Join-Path $dest "scripts")

$zipPath = "releases\GhostTweak_Buyer_Pack.zip"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path "$dest\*" -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item -Recurse -Force $dest

Write-Host "Архив успешно создан:"
Get-Item $zipPath | Select-Object Name, Length
