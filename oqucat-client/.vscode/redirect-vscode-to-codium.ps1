$codium = @(
  "$env:LOCALAPPDATA\Programs\VSCodium\VSCodium.exe",
  "$env:ProgramFiles\VSCodium\VSCodium.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $codium) { throw "VSCodium.exe was not found. Set `$codium to its full path." }

$handler = "$env:LOCALAPPDATA\VSCodium\vscode-uri.ps1"
New-Item -ItemType Directory -Force (Split-Path $handler) | Out-Null

@"
param([string]`$Url)
if (`$Url -notlike 'vscode://file/*') { exit 1 }

`$targetUrl = `$Url -replace '^vscode:', 'vscodium:'
Start-Process -FilePath '$($codium.Replace("'", "''"))' -ArgumentList @('--open-url', '--', `$targetUrl)
"@ | Set-Content -LiteralPath $handler -Encoding utf8

$key = 'HKCU:\Software\Classes\vscode'
New-Item -Path "$key\shell\open\command" -Force | Out-Null
New-ItemProperty -Path $key -Name 'URL Protocol' -Value '' -Force | Out-Null
Set-ItemProperty -Path "$key\shell\open\command" -Name '(Default)' `
  -Value "`"$((Get-Command powershell.exe).Source)`" -NoProfile -File `"$handler`" `"%1`""