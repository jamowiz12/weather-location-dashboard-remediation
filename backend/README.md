# Weather and Location Dashboard API

This Laravel 12 application provides the JSON API for the Next.js dashboard. It uses Sanctum stateful session authentication, SQLite for local development, and PostgreSQL when configured for hosting.

## Local development

Use PHP 8.2 or newer and Composer. From PowerShell:

```powershell
Set-Location 'C:\Users\Jamowiz\WeatherLocationDashboard\backend'
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
composer install
$php82 = 'C:\Path\To\PHP82\php.exe'
& $php82 artisan key:generate
& $php82 artisan migrate
& $php82 artisan serve --host 127.0.0.1 --port 8000
```

Replace the PHP executable path with the installed PHP 8.2+ binary. Only generate an application key for a newly initialized environment; changing an existing key can make encrypted MFA secrets unreadable. The example configuration uses SQLite and local log mail. Never replace an existing `.env` or run migrations against a shared database without confirming the target and taking a backup.

The local API base URL is `http://127.0.0.1:8000`. Browser clients must first request `GET /sanctum/csrf-cookie` and then include session cookies and the `X-XSRF-TOKEN` header on state-changing requests. The frontend API helper handles this flow.

## Tests

```powershell
& $php82 artisan test
```

The PHPUnit suite uses in-memory SQLite. It validates application behavior, not connectivity to a hosted PostgreSQL database or external email/weather providers.

## Configuration and references

`OPENWEATHER_API_KEY` and mail credentials are backend-only. The `.env.example` file documents local defaults and PostgreSQL configuration placeholders; it contains no real credentials.

- [Full local setup](../docs/local-setup.md)
- [API endpoints](../docs/API.md)
- [Architecture](../docs/architecture/architecture.md)
- [Deployment guidance](../docs/deployment.md)
