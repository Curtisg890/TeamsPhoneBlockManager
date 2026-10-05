param(
    [Parameter(Mandatory)]
    [string]$Identity
)

$ErrorActionPreference = "Stop"

. "$PSScriptRoot\ConnectTeamsApp.ps1"

Remove-CsInboundBlockedNumberPattern `
    -Identity $Identity `
    -ErrorAction Stop

Write-Output "Deleted"