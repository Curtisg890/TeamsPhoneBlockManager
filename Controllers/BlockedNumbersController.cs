using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TeamsBlockManager.Models;
using TeamsBlockManager.Services;

[ApiController]
[Route("api/[controller]")]
public class BlockedNumbersController
    : ControllerBase
{
    private readonly PowerShellService _ps;
    private readonly IWebHostEnvironment _environment;

    public BlockedNumbersController(
        PowerShellService ps,
        IWebHostEnvironment environment)
    {
        _ps = ps;
        _environment = environment;
    }
    private string GetScriptPath(
    string scriptName)
    {
        return Path.Combine(
            _environment.ContentRootPath,
            "Scripts",
            scriptName);
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result =
            await _ps.RunScript(
        GetScriptPath(
        "GetBlockedNumbers.ps1"));

        var numbers =
            JsonSerializer.Deserialize<
                List<BlockedNumber>>(result);

        return Ok(numbers);
    }

    [HttpPost]
    public async Task<IActionResult> Add(
        [FromBody] AddBlockedNumberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Number))
        {
            return BadRequest("Number required");
        }

        string identity =
            $"Blocked-{request.Number.Replace("+", "")}";

        string pattern =
            $"^\\{request.Number}$";

        string args =
            $"-Identity \"{identity}\" " +
            $"-Pattern \"{pattern}\" " +
            $"-Description \"{request.Description}\"";

        var result =
            await _ps.RunScript(
    GetScriptPath(
        "AddBlockedNumber.ps1"),
    args);

        return Ok(result);
    }

    [HttpDelete("{identity}")]
    public async Task<IActionResult> Delete(
    string identity)
    {
        string args =
            $"-Identity \"{identity}\"";

        var result =
            await _ps.RunScript(
    GetScriptPath(
        "RemoveBlockedNumber.ps1"),
    args);

        return Ok(result);
    }
    [HttpGet("path")]
    public IActionResult ScriptPath()
    {
        return Ok(
            GetScriptPath(
                "GetBlockedNumbers.ps1"));
    }

}