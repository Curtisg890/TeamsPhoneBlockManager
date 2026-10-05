using System.Diagnostics;

namespace TeamsBlockManager.Services;

public class PowerShellService
{
    public async Task<string> RunScript(
        string script,
        string arguments = "")
    {
        Process process = new Process();

        process.StartInfo.FileName = "pwsh.exe";

        process.StartInfo.Arguments =
            $"-File \"{script}\" {arguments}";

        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;

        process.StartInfo.UseShellExecute = false;

        process.Start();

        string output =
            await process.StandardOutput.ReadToEndAsync();

        string error =
            await process.StandardError.ReadToEndAsync();

        if (!string.IsNullOrWhiteSpace(error))
        {
            throw new Exception(error);
        }

        return output;
    }
}