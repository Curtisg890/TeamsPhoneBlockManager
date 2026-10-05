$ErrorActionPreference = "Stop"

. "$PSScriptRoot\ConnectTeamsApp.ps1"

Get-CsInboundBlockedNumberPattern |
Out-Null

Write-Output "Teams authentication successful"