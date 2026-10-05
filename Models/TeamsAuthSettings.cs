namespace TeamsBlockManager.Models;

public class TeamsAuthSettings
{
    public string TenantId { get; set; } = "";

    public string ApplicationId { get; set; } = "";

    public string CertificateThumbprint { get; set; } = "";
}