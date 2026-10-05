$config =
    Get-Content `
        "$PSScriptRoot\..\Settings\teamsauth.json" |
    ConvertFrom-Json

$TenantId =
    $config.TenantId

$ApplicationId =
    $config.ApplicationId

$Thumbprint =
    $config.CertificateThumbprint

Connect-MicrosoftTeams `
    -TenantId $TenantId `
    -ApplicationId $ApplicationId `
    -CertificateThumbprint $Thumbprint |
    Out-Null