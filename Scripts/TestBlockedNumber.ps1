param(
    [string]$Number
)

Connect-MicrosoftTeams

Test-CsInboundBlockedNumberPattern `
    -PhoneNumber $Number