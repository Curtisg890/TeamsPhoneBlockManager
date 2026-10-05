# Microsoft Teams Phone Block Manager

[![License](https://img.shields.io/github/license/Curtisg890/TeamsPhoneBlockManager[![Stars](https://img.shields.io/github/stars/Curtisg890/TeamsPhoneBlockManager)ithub.com/Curtisg890/TeamsPhoneBlockManager/stargazers)

[![Issues](https://img.shields.io/github/issues/Curtisg890/TeamsPhoneBlockManager)](https://urtisg890/TeamsPhoneBlockManager/issues)

Microsoft Teams Phone Block Manager is an open-source web application for managing the tenant-wide inbound PSTN blocked-number list in Microsoft Teams.

The application provides a browser-based interface for viewing, searching, adding, and deleting blocked phone-number patterns without requiring administrators to run Teams PowerShell commands manually.

It uses:

- ASP.NET Core Web API
- React and Vite
- Microsoft Teams PowerShell
- Microsoft Entra application authentication
- Certificate-based authentication
- IIS for Windows hosting

> [!IMPORTANT]
> This is an unofficial community project. It is not developed, maintained, endorsed, or supported by Microsoft.

## Features

- View tenant-wide blocked calling-number patterns
- Search numbers and descriptions
- Add exact-match blocked phone numbers
- Add descriptions to blocked-number entries
- Delete blocked-number entries
- Display whether each pattern is enabled
- Configure Tenant ID, Application ID, and certificate thumbprint from an admin page
- Test the Microsoft Teams connection from the web interface
- Use unattended certificate-based authentication
- Host the complete application internally using IIS
- Display loading, success, and error messages
- Avoid interactive Microsoft 365 sign-in prompts

## Screenshots

### Block List

<img src="docs/screenshots/block-list.png">

### Settings

<img src="docs/screenshots/settings-page.png">

## How It Works

```text
Web browser
    |
    v
React frontend
    |
    v
ASP.NET Core API
    |
    v
PowerShell 7
    |
    v
Microsoft Teams PowerShell
    |
    v
Microsoft Teams tenant
```

The ASP.NET API executes PowerShell scripts that use the Microsoft Teams PowerShell module.

The application authenticates to Microsoft Teams using:

- Microsoft Entra Tenant ID
- Microsoft Entra Application ID
- A certificate and private key

No client secret is required.

## Supported Teams Phone Connectivity

Tenant-wide inbound PSTN number blocking can be used with:

- Microsoft Calling Plans
- Operator Connect
- Direct Routing

The feature applies to inbound calls originating from the PSTN.

## Requirements

### Development machine

- Windows 10 or Windows 11
- Visual Studio 2022
- .NET 8 SDK
- Node.js and npm
- PowerShell 7
- Microsoft Teams PowerShell module
- Git, if cloning or contributing to the repository

### IIS server

- Windows Server, or a Windows machine with IIS
- IIS Management Tools
- .NET 8 Hosting Bundle
- PowerShell 7
- Microsoft Teams PowerShell module
- A machine certificate containing a private key
- Network access to Microsoft 365 and Microsoft Entra endpoints

### Microsoft 365 tenant

- Microsoft Teams Phone
- Permission to create an Entra app registration
- Permission to grant Microsoft Graph application permissions
- Permission to assign a Microsoft Entra administrative role
- Permission to manage Teams Phone blocked-number patterns

## Repository Structure

A typical project structure looks like:

```text
TeamsPhoneBlockManager/
|
|-- Controllers/
|   |-- BlockedNumbersController.cs
|   `-- SettingsController.cs
|
|-- Models/
|   |-- BlockedNumber.cs
|   |-- AddBlockedNumberRequest.cs
|   `-- TeamsAuthSettings.cs
|
|-- Services/
|   `-- PowerShellService.cs
|
|-- Scripts/
|   |-- ConnectTeamsApp.ps1
|   |-- GetBlockedNumbers.ps1
|   |-- AddBlockedNumber.ps1
|   |-- RemoveBlockedNumber.ps1
|   `-- TestConnection.ps1
|
|-- Settings/
|   `-- teamsauth.example.json
|
|-- frontend/
|   |-- src/
|   |   `-- App.jsx
|   |-- package.json
|   `-- package-lock.json
|
|-- wwwroot/
|-- Program.cs
|-- appsettings.json
|-- TeamsBlockManager.csproj
|-- README.md
|-- LICENSE
`-- .gitignore
```

# Installation

## 1. Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/Curtisg890/TeamsPhoneBlockManager.git
cd TeamsPhoneBlockManager
```

## 2. Restore the .NET Dependencies

From the ASP.NET project directory, run:

```powershell
dotnet restore
```

Alternatively, open the solution in Visual Studio and allow Visual Studio to restore the required NuGet packages.

## 3. Install the Frontend Dependencies

Enter the React frontend directory:

```powershell
cd frontend
npm install
cd ..
```

## 4. Install PowerShell 7

Install PowerShell 7 on both the development machine and the IIS server.

Verify that `pwsh.exe` is available:

```powershell
Get-Command pwsh.exe
```

The application invokes `pwsh.exe`, not the legacy Windows PowerShell executable.

## 5. Install the Microsoft Teams PowerShell Module

Open PowerShell as Administrator and run:

```powershell
Install-Module MicrosoftTeams -Scope AllUsers -Force
```

Verify the installation:

```powershell
Import-Module MicrosoftTeams
Get-Module MicrosoftTeams -ListAvailable
```

# Microsoft Entra Configuration

## 6. Create an App Registration

Open the Microsoft Entra admin centre and navigate to:

```text
Identity
> Applications
> App registrations
> New registration
```

Use a name such as:

```text
Teams Phone Block Manager
```

Select:

```text
Accounts in this organisational directory only
```

Create the registration and record:

- Directory (tenant) ID
- Application (client) ID

Do not commit these values to a public repository.

## 7. Add the Microsoft Graph Permission

Open the app registration and navigate to:

```text
API permissions
> Add a permission
> Microsoft Graph
> Application permissions
```

Add:

```text
Organization.Read.All
```

Then select:

```text
Grant admin consent
```

Do not create a client secret. This project uses certificate-based authentication.

## 8. Assign a Microsoft Entra Role

The enterprise application/service principal requires a supported Microsoft Entra administrative role.

For initial testing, the following role can be used:

```text
Teams Administrator
```

Navigate to:

```text
Identity
> Roles and administrators
> Teams Administrator
> Add assignments
```

Search for the application name and assign the role.

Review the assigned role before using the application in production and apply least privilege where possible.

# Certificate Setup

## 9. Generate a Certificate

Open PowerShell as Administrator and run:

```powershell
$certificate = New-SelfSignedCertificate `
    -Subject "CN=TeamsPhoneBlockManager" `
    -CertStoreLocation "Cert:\LocalMachine\My" `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -NotAfter (Get-Date).AddYears(3)
```

Display its details:

```powershell
$certificate |
    Select-Object Subject, Thumbprint, NotAfter, HasPrivateKey
```

`HasPrivateKey` must be:

```text
True
```

Record the thumbprint.

## 10. Export the Public Certificate

Create a temporary export directory:

```powershell
New-Item -Path "C:\Temp" -ItemType Directory -Force
```

Export the public certificate:

```powershell
Export-Certificate `
    -Cert $certificate `
    -FilePath "C:\Temp\TeamsPhoneBlockManager.cer"
```

The `.cer` file contains the public certificate and is suitable for uploading to Microsoft Entra. The private key remains in the Windows certificate store.

Never upload a PFX file or private key to GitHub.

## 11. Upload the Certificate to Entra

Open the app registration and navigate to:

```text
Certificates & secrets
> Certificates
> Upload certificate
```

Upload:

```text
C:\Temp\TeamsPhoneBlockManager.cer
```

Confirm that the certificate listed in Entra matches the certificate installed locally.

A mismatched certificate or incorrect Application ID can produce an error similar to:

```text
AADSTS700027: The certificate with identifier used to sign
client assertion is not registered on application.
```

## 12. Test Authentication Manually

Replace the placeholder values and run:

```powershell
Import-Module MicrosoftTeams

$certificateThumbprint =
    "YOUR-CERTIFICATE-THUMBPRINT"

$certificate =
    Get-ChildItem "Cert:\LocalMachine\My" |
    Where-Object {
        $_.Thumbprint -eq $certificateThumbprint
    } |
    Select-Object -First 1

if ($null -eq $certificate) {
    throw "The certificate could not be found."
}

if (-not $certificate.HasPrivateKey) {
    throw "The certificate does not have a private key."
}

Connect-MicrosoftTeams `
    -ApplicationId "YOUR-APPLICATION-ID" `
    -TenantId "YOUR-TENANT-ID" `
    -Certificate $certificate

Get-CsInboundBlockedNumberPattern
```

The command should connect without opening an interactive sign-in window.

Do not continue to IIS configuration until this test succeeds.

# Application Configuration

## 13. Create `teamsauth.json`

The real settings file is deliberately excluded from source control.

Copy:

```text
Settings/teamsauth.example.json
```

to:

```text
Settings/teamsauth.json
```

Populate it with:

```json
{
  "TenantId": "YOUR-TENANT-ID",
  "ApplicationId": "YOUR-APPLICATION-ID",
  "CertificateThumbprint": "YOUR-CERTIFICATE-THUMBPRINT"
}
```

Do not commit this file.

The application's Settings page can update these values after deployment.

## 14. Verify `ConnectTeamsApp.ps1`

The connection script should read the settings file and retrieve the certificate from the Local Machine certificate store.

Example:

```powershell
$ErrorActionPreference = "Stop"

$configPath =
    Join-Path `
        $PSScriptRoot `
        "..\Settings\teamsauth.json"

if (-not (Test-Path $configPath)) {
    throw "The Teams authentication settings file was not found."
}

$config =
    Get-Content `
        $configPath `
        -Raw |
    ConvertFrom-Json

$tenantId =
    $config.TenantId

$applicationId =
    $config.ApplicationId

$thumbprint =
    $config.CertificateThumbprint.Replace(" ", "")

if ([string]::IsNullOrWhiteSpace($tenantId)) {
    throw "Tenant ID is missing."
}

if ([string]::IsNullOrWhiteSpace($applicationId)) {
    throw "Application ID is missing."
}

if ([string]::IsNullOrWhiteSpace($thumbprint)) {
    throw "Certificate thumbprint is missing."
}

$certificate =
    Get-ChildItem "Cert:\LocalMachine\My" |
    Where-Object {
        $_.Thumbprint -eq $thumbprint
    } |
    Select-Object -First 1

if ($null -eq $certificate) {
    throw "The certificate could not be found in LocalMachine\My."
}

if (-not $certificate.HasPrivateKey) {
    throw "The certificate does not have an accessible private key."
}

Import-Module MicrosoftTeams -ErrorAction Stop

Connect-MicrosoftTeams `
    -TenantId $tenantId `
    -ApplicationId $applicationId `
    -Certificate $certificate `
    -ErrorAction Stop |
    Out-Null
```

# Running the Application for Development

## 15. Start the API

Open the ASP.NET solution in Visual Studio and press:

```text
F5
```

Alternatively:

```powershell
dotnet run
```

Use Swagger to verify the endpoints.

Typical endpoints include:

```text
GET    /api/BlockedNumbers
POST   /api/BlockedNumbers
DELETE /api/BlockedNumbers/{identity}

GET    /api/Settings
POST   /api/Settings
POST   /api/Settings/test
GET    /api/Settings/diagnostics
```

## 16. Start the React Development Server

Open a second terminal:

```powershell
cd frontend
npm run dev
```

Open the local Vite address displayed in the terminal.

When React runs separately from the API, development CORS configuration may be required in the ASP.NET application.

# Building the Frontend

## 17. Use Relative API Paths

For published deployments, React should use relative API paths:

```jsx
const BLOCKLIST_API =
    "/api/BlockedNumbers";

const SETTINGS_API =
    "/api/Settings";
```

Do not hardcode a development URL such as:

```text
https://localhost:7046
```

Relative paths allow the same build to work under different IIS hostnames.

## 18. Build React

From the frontend directory:

```powershell
npm run build
```

Vite creates:

```text
frontend\dist
```

Copy the contents of `frontend\dist` into the ASP.NET project's:

```text
wwwroot
```

The resulting structure should be:

```text
wwwroot/
|-- index.html
`-- assets/
```

It should not be:

```text
wwwroot/dist/index.html
```

## 19. Configure ASP.NET Static Files

The lower section of `Program.cs` should include static-file support and a fallback to the React entry page.

Example:

```csharp
app.UseHttpsRedirection();

app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
```

After building React and copying it into `wwwroot`, stop the Vite development server and run the ASP.NET application.

Browse to the ASP.NET application root. The React interface should load directly from ASP.NET.

# Publishing to IIS

## 20. Publish from Visual Studio

In Visual Studio:

1. Right-click the ASP.NET project.
2. Select **Publish**.
3. Select **Folder**.
4. Choose an output folder, for example:

```text
C:\Publish\TeamsPhoneBlockManager
```

5. Select the Release configuration.
6. Publish the application.

Verify that the output contains:

```text
TeamsBlockManager.dll
web.config
wwwroot/
Scripts/
Settings/
```

Do not include a populated `teamsauth.json` in a public GitHub release.

For a private deployment package, create the settings file after extracting the package onto the server.

## 21. Install IIS Requirements

Install IIS:

```powershell
Install-WindowsFeature `
    Web-Server `
    -IncludeManagementTools
```

Install the matching .NET 8 Hosting Bundle on the IIS server.

Install PowerShell 7.

Install the Teams PowerShell module for all users:

```powershell
Install-Module MicrosoftTeams `
    -Scope AllUsers `
    -Force
```

Verify PowerShell 7:

```powershell
Get-Command pwsh.exe
```

## 22. Copy the Application

Create a deployment directory:

```text
C:\inetpub\TeamsPhoneBlockManager
```

Copy the published files into that directory.

The deployed structure should resemble:

```text
C:\inetpub\TeamsPhoneBlockManager
|
|-- TeamsBlockManager.dll
|-- web.config
|-- Scripts
|-- Settings
`-- wwwroot
```

## 23. Create the IIS Application Pool

Open IIS Manager and create an Application Pool:

```text
Name: TeamsPhoneBlockManager
.NET CLR version: No Managed Code
Managed pipeline mode: Integrated
```

For production, use either:

- Application Pool Identity with access granted to the certificate private key
- A dedicated service account with access granted to the certificate private key

Do not use a personal user account for production.

## 24. Create the IIS Website

Create a website with:

```text
Site name:
TeamsPhoneBlockManager

Physical path:
C:\inetpub\TeamsPhoneBlockManager

Application pool:
TeamsPhoneBlockManager
```

Configure an HTTPS binding and an appropriate DNS record for the internal site.

## 25. Grant Private-Key Permission

The IIS identity must have read access to the certificate private key.

Open:

```text
certlm.msc
```

Navigate to:

```text
Personal
> Certificates
```

Find the Teams Phone Block Manager certificate.

Right-click it and select:

```text
All Tasks
> Manage Private Keys
```

Add:

```text
IIS APPPOOL\TeamsPhoneBlockManager
```

Grant:

```text
Read
```

If the application pool uses a dedicated service account, grant Read permission to that account instead.

Failure to grant this permission commonly produces:

```text
Keyset does not exist
```

The certificate should also show:

```text
You have a private key that corresponds to this certificate.
```

## 26. Allow the Application to Save Settings

If administrators will update authentication settings through the web page, the IIS identity needs permission to modify:

```text
Settings\teamsauth.json
```

Grant the application-pool identity Modify permission to the individual settings file or to the `Settings` directory.

Avoid granting unnecessary Modify permission to the entire website directory.

## 27. Protect the Website

This application can change tenant-wide Microsoft Teams calling configuration and should not be anonymously accessible.

For an internal IIS deployment, consider:

```text
Anonymous Authentication: Disabled
Windows Authentication: Enabled
```

Restrict access to a dedicated Active Directory security group, for example:

```text
Teams Phone Block Manager Admins
```

The certificate authenticates the server application to Microsoft Teams. It does not authenticate or authorise users visiting the website.

# Using the Application

## Block List Page

The Block List page displays the current tenant-wide inbound blocked-number patterns.

Available functions include:

- Search by identity or description
- Refresh the list
- Add a number
- Delete an entry
- View whether a pattern is enabled

## Adding a Number

Enter a number in international E.164 format.

Example:

```text
+442079460001
```

Enter a description:

```text
Repeated nuisance caller
```

Select **Add**.

The application creates an exact-match pattern similar to:

```regex
^\+442079460001$
```

The application then refreshes the list.

Changes in Microsoft Teams may not become effective immediately.

## Deleting a Number

Select **Delete** beside an entry and confirm the deletion.

The application deletes the entry using its Teams blocked-number identity and refreshes the list.

## Settings Page

The Settings page contains:

- Tenant ID
- Application ID
- Certificate Thumbprint
- Save Settings
- Test Connection

> [!WARNING]
> Do not change the authentication settings unless you understand the Microsoft Entra and Microsoft Teams PowerShell configuration. Incorrect values can prevent the application from connecting to Microsoft Teams.

After changing settings, select **Save Settings**, then select **Test Connection**.

A successful test confirms that the application can:

- Read the settings file
- Locate the certificate
- Access the private key
- Authenticate using the Entra application
- Run a Teams blocked-number cmdlet

# API Overview

## List blocked numbers

```http
GET /api/BlockedNumbers
```

## Add a blocked number

```http
POST /api/BlockedNumbers
Content-Type: application/json
```

Example body:

```json
{
  "number": "+442079460001",
  "description": "Repeated nuisance caller"
}
```

## Delete a blocked number

```http
DELETE /api/BlockedNumbers/{identity}
```

## Read settings

```http
GET /api/Settings
```

## Save settings

```http
POST /api/Settings
Content-Type: application/json
```

Example body:

```json
{
  "tenantId": "YOUR-TENANT-ID",
  "applicationId": "YOUR-APPLICATION-ID",
  "certificateThumbprint": "YOUR-CERTIFICATE-THUMBPRINT"
}
```

## Test connection

```http
POST /api/Settings/test
```

## Diagnostics

```http
GET /api/Settings/diagnostics
```

The diagnostics endpoint must not expose a private key, certificate contents, access token, password, or secret.

# Troubleshooting

## Interactive Microsoft Sign-In Appears

Confirm that `ConnectTeamsApp.ps1` uses application authentication:

```powershell
Connect-MicrosoftTeams `
    -TenantId $tenantId `
    -ApplicationId $applicationId `
    -Certificate $certificate
```

Remove any interactive call such as:

```powershell
Connect-MicrosoftTeams
```

## Certificate Cannot Be Found

Verify the configured thumbprint:

```powershell
Get-ChildItem Cert:\LocalMachine\My |
    Select-Object Subject, Thumbprint, HasPrivateKey
```

Confirm:

- The thumbprint matches `teamsauth.json`
- The certificate is in `LocalMachine\My`
- `HasPrivateKey` is `True`

Remove spaces or hidden characters from copied thumbprints.

## AADSTS700027

Example:

```text
The certificate with identifier used to sign the client assertion
is not registered on application.
```

Check:

- The correct Application ID is configured
- The correct certificate was uploaded to that app registration
- The locally installed certificate matches the uploaded public certificate
- The configured thumbprint belongs to that certificate

If necessary, export the public certificate again from the installed certificate and upload that exact `.cer` file to the app registration.

## Keyset Does Not Exist

Example:

```text
One or more errors occurred. Keyset does not exist.
```

This generally means IIS can locate the certificate but cannot access its private key.

Open:

```text
certlm.msc
```

Use:

```text
Certificate
> All Tasks
> Manage Private Keys
```

Grant Read access to:

```text
IIS APPPOOL\TeamsPhoneBlockManager
```

or the dedicated application-pool service account.

Recycle the application pool and test again.

## Application Works in Visual Studio but Not IIS

Visual Studio normally runs under the signed-in developer account. IIS runs under the configured application-pool identity.

Check:

- The certificate is installed under `LocalMachine\My`
- The IIS identity has private-key Read permission
- PowerShell 7 is installed
- MicrosoftTeams is installed with `-Scope AllUsers`
- The `Scripts` directory was included in the published output
- The `Settings` directory exists
- IIS has read access to the deployed files
- IIS has write access to `teamsauth.json` if settings are changed through the UI

## Settings Cannot Be Saved

The IIS identity needs permission to modify:

```text
Settings\teamsauth.json
```

Grant the application-pool identity Modify permission to the individual settings file or the `Settings` directory.

Avoid granting unnecessary Modify permission across the entire website directory.

## PowerShell Script Cannot Be Found

Use absolute script paths generated from the ASP.NET content root rather than assuming a working directory.

Example:

```csharp
private string ScriptPath(
    string scriptName)
{
    return Path.Combine(
        _environment.ContentRootPath,
        "Scripts",
        scriptName);
}
```

Ensure all `.ps1` files are copied during publishing.

## Raw PowerShell Formatting Appears in Errors

PowerShell may return ANSI colour codes such as:

```text
\u001B[31;1m
```

These can be stripped in the PowerShell execution service before displaying errors in the UI.

Do not return ASP.NET stack traces or sensitive configuration information to unauthorised users in production.

# Security Guidance

- Never commit `Settings/teamsauth.json`
- Never commit PFX, P12, PEM, KEY, or private-key files
- Never put certificate private keys in `wwwroot`
- Never put credentials in React
- Never return access tokens from API endpoints
- Restrict the website to authorised administrators
- Restrict settings-file write permissions
- Grant only Read access to the certificate private key
- Review the Entra role assigned to the application
- Remove expired certificates from the Entra application
- Replace certificates before expiration
- Keep PowerShell, .NET, Node.js, and MicrosoftTeams dependencies updated
- Review application logs for failed configuration changes
- Treat the Settings page as an administrative function

Anything stored under `wwwroot` may be accessible to a browser. Authentication settings and certificates should remain outside `wwwroot`.

# Files Excluded from Git

The repository `.gitignore` should exclude at least:

```gitignore
# Visual Studio
.vs/
bin/
obj/
*.user
*.suo

# React
frontend/node_modules/
frontend/dist/

# Private runtime configuration
Settings/teamsauth.json

# Certificates and keys
*.pfx
*.p12
*.pem
*.key

# Publish output
publish/
Publish/

# Logs
*.log
Logs/

# Environment configuration
.env
.env.*
```

Before every public push, run:

```powershell
git status
git ls-files
```

Confirm that no production configuration, private certificates, credentials, internal hostnames, or customer information are present.

# Building a Release

A normal source-controlled build process is:

```powershell
git clone https://github.com/Curtisg890/TeamsPhoneBlockManager.git
cd TeamsPhoneBlockManager

dotnet restore

cd frontend
npm install
npm run build
cd ..

# Copy frontend/dist contents into wwwroot
dotnet publish -c Release -o publish
```

Create the real `teamsauth.json` after deployment.

Install the certificate separately into the Windows certificate store.

Do not include a private certificate or populated authentication settings file in public release archives.

# Updating an Existing Deployment

A suggested update process is:

1. Back up the current deployment directory.
2. Back up `Settings\teamsauth.json`.
3. Stop or recycle the IIS application pool.
4. Replace the application files with the newly published files.
5. Restore `teamsauth.json` if necessary.
6. Confirm certificate permissions remain in place.
7. Start the application pool.
8. Test the Settings connection.
9. Test listing blocked numbers.
10. Add and remove a test entry if appropriate.

# Contributing

Contributions, bug reports, and feature suggestions are welcome.

Suggested workflow:

```powershell
git checkout -b feature/my-change
git add .
git commit -m "Describe the change"
git push -u origin feature/my-change
```

Then open a pull request.

Before submitting a contribution:

- Do not include tenant-specific configuration
- Do not include certificates
- Do not include private keys
- Do not include customer or organisation information
- Confirm the frontend builds
- Confirm the ASP.NET project builds
- Test the affected API endpoint
- Document new configuration requirements

# Suggested Future Improvements

Potential enhancements include:

- Enable and disable individual patterns
- Bulk CSV import
- CSV export
- Pattern and number testing
- Audit logging
- Role-based application authorisation
- Improved diagnostics page
- Pagination
- Support for exempt-number patterns
- Resource-account redirection
- Automated build and release workflow
- Automated tests
- Container deployment documentation

# Microsoft Documentation

Useful Microsoft documentation:

- [Block inbound calls in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/block-inbound-calls)
- [Application-based authentication in Teams PowerShell](https://learn.microsoft.com/en-us/microsoftteams/teams-powershell-application-authentication)
- [Connect-MicrosoftTeams PowerShell reference](https://learn.microsoft.com/en-us/powershell/module/microsoftteams/connect-microsoftteams?view=teams-ps)
- [Publish an ASP.NET Core app to IIS](https://learn.microsoft.com/en-us/aspnet/core/tutorials/publish-to-iis)
- [Serve static files in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files)

# Disclaimer

This project modifies Microsoft Teams tenant-wide inbound calling configuration.

Review and test the application in a non-production environment before using it in production.

The project authors and contributors are not responsible for:

- Incorrectly blocked phone numbers
- Calling disruption
- Configuration mistakes
- Security incidents
- Permission changes
- Microsoft API or PowerShell module changes
- Loss of configuration or data

Use this project at your own risk.

# License

This project is licensed under the MIT License.

See the `LICENSE` file for the full licence text.
