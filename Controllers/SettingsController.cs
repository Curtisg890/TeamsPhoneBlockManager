using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TeamsBlockManager.Models;
using TeamsBlockManager.Services;
using System.Security.Cryptography.X509Certificates;

namespace TeamsBlockManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly PowerShellService _ps;

    public SettingsController(
        IWebHostEnvironment environment,
        PowerShellService ps)
    {
        _environment = environment;
        _ps = ps;
    }

    private string ConfigFile()
    {
        return Path.Combine(
            _environment.ContentRootPath,
            "Settings",
            "teamsauth.json");
    }

    private string ScriptPath(
        string scriptName)
    {
        return Path.Combine(
            _environment.ContentRootPath,
            "Scripts",
            scriptName);
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            string json =
                System.IO.File.ReadAllText(
                    ConfigFile());

            var settings =
                JsonSerializer.Deserialize<
                    TeamsAuthSettings>(
                        json);

            return Ok(settings);
        }
        catch (Exception ex)
        {
            return BadRequest(
                new
                {
                    Error =
                        ex.Message
                });
        }
    }

    [HttpPost]
    public IActionResult Save(
        [FromBody]
        TeamsAuthSettings settings)
    {
        try
        {
            string json =
                JsonSerializer.Serialize(
                    settings,
                    new JsonSerializerOptions
                    {
                        WriteIndented =
                            true
                    });

            System.IO.File.WriteAllText(
                ConfigFile(),
                json);

            return Ok(
                new
                {
                    Success = true
                });
        }
        catch (Exception ex)
        {
            return BadRequest(
                new
                {
                    Error =
                        ex.Message
                });
        }
    }

    [HttpPost("test")]
    public async Task<IActionResult> Test()
    {
        try
        {
            string result =
                await _ps.RunScript(
                    ScriptPath(
                        "TestConnection.ps1"));

            return Ok(
                new
                {
                    Success = true,
                    Result =
                        result
                });
        }
        catch (Exception ex)
        {
            return BadRequest(
                new
                {
                    Success = false,
                    Error =
                        ex.Message
                });
        }
    }

    [HttpGet("diagnostics")]
    public IActionResult Diagnostics()
    {
        try
        {
            string file =
                ConfigFile();

            bool exists =
                System.IO.File.Exists(
                    file);

            return Ok(
                new
                {
                    CurrentUser =
                        Environment.UserName,

                    SettingsFile =
                        file,

                    SettingsFileExists =
                        exists,

                    ContentRoot =
                        _environment
                            .ContentRootPath
                });
        }
        catch (Exception ex)
        {
            return BadRequest(
                new
                {
                    Error =
                        ex.Message
                });
        }

    }
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        return Ok(new
        {
            User =
                Environment.UserName
        });
    }
    [HttpGet("certs")]
    public IActionResult Certs()
    {
        using var store =
            new X509Store(
                StoreName.My,
                StoreLocation.CurrentUser);

        store.Open(OpenFlags.ReadOnly);

        return Ok(
            store.Certificates
                 .Cast<X509Certificate2>()
                 .Select(c => new
                 {
                     c.Subject,
                     c.Thumbprint,
                     c.HasPrivateKey
                 }));
    }
}