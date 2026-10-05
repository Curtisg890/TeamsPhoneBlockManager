namespace TeamsBlockManager.Models;

public class BlockedNumber
{
    public string? Identity { get; set; }

    public string? Description { get; set; }

    public string? Pattern { get; set; }

    public bool Enabled { get; set; }
}