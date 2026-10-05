param(
    [Parameter(Mandatory)]
    [string]$Identity,

    [Parameter(Mandatory)]
    [string]$Pattern,

    [string]$Description
)

$ErrorActionPreference = "Stop"

. "$PSScriptRoot\ConnectTeamsApp.ps1"

New-CsInboundBlockedNumberPattern `
    -Identity $Identity `
    -Pattern $Pattern `
    -Description $Description `
    -ErrorAction Stop |
    Out-Null

Write-Output "Success"