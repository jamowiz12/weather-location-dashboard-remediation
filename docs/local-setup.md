# Local Setup

These instructions are for the existing Windows project at `C:\Users\Jamowiz\WeatherLocationDashboard`. They avoid replacing existing local environment files. The backend requires PHP 8.2 or newer; this machine's default `php` command may resolve to XAMPP PHP 8.0, so use the installed PHP 8.2 executable explicitly.

## Prerequisites

- Node.js and npm
- PHP 8.2+ with the extensions required by Laravel
- Composer
- The checked-in project dependencies (`frontend/node_modules` and `backend/vendor`) or permission to install them

## Frontend

Open a PowerShell terminal:

```powershell
Set-Location 'C:\Users\Jamowiz\WeatherLocationDashboard\frontend'
if (-not (Test-Path '.env.local')) { Copy-Item '.env.example' '.env.local' }
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

The frontend is available at `http://127.0.0.1:3001`. Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in `frontend/.env.local`. A Google Maps Embed key is optional for local UI; if supplied, it is browser-visible and must be restricted to approved APIs and frontend origins.

## Laravel API

Use a second PowerShell terminal:

```powershell
Set-Location 'C:\Users\Jamowiz\WeatherLocationDashboard\backend'
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
$php82 = 'C:\Users\Jamowiz\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe'
& $php82 --version
```

If using a newly copied `.env`, generate its application key once:

```powershell
& $php82 artisan key:generate
```

Do not regenerate an existing key: encrypted MFA secrets depend on it. The example backend environment uses SQLite locally. Before running migrations against an existing database, verify `DB_CONNECTION` and back up the database file. Then run:

```powershell
& $php82 artisan migrate
& $php82 artisan serve --host 127.0.0.1 --port 8000
```

The health endpoint is `http://127.0.0.1:8000/api/health`. `OPENWEATHER_API_KEY` is backend-only. Without a key the weather endpoint reports `not_configured`; it does not return sample weather as if it were live. Password reset email requires a real mail provider; `MAIL_MAILER=log` is suitable only for local inspection.

## Tests and Build

From the frontend directory:

```powershell
npm run lint
npm run build
```

From the backend directory:

```powershell
& $php82 artisan test
```

The Laravel feature suite uses its configured in-memory SQLite database. It does not prove connectivity to Supabase or a production database.

## Supabase/PostgreSQL

For a deployment, configure the backend environment with the provider's PostgreSQL host, port, database, username, password, and required SSL mode. Set `DB_CONNECTION=pgsql` and keep all database credentials on the backend. No production database connection or migration is claimed by this local guide. Review and approve migrations before running them against any shared or production database.

Related references: [README](../README.md), [API](API.md), [deployment](deployment.md), and [architecture](architecture.mmd).
