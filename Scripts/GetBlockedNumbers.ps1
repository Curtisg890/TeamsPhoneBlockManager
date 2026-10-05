$ErrorActionPreference = "Stop"

. "$PSScriptRoot\ConnectTeamsApp.ps1"

$results =
    Get-CsInboundBlockedNumberPattern |
    Select-Object `
        Identity,
        Description,
        Pattern,
        Enabled

@($results) |
    ConvertTo-Json `
        -Depth 3 `
        -Compress