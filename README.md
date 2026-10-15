# Weather and Location Dashboard

A full-stack weather and secure account dashboard built with Next.js on the frontend and Laravel on the backend.

## Verified local status

The project is currently validated for local development using the supported PHP 8.2 runtime. The frontend and backend are expected to run against the local hosts below:

- Frontend: http://127.0.0.1:3001
- Backend: http://127.0.0.1:8000

This project has not been deployed to production and no live hosting credentials or provider setup were provided.

## Features

- User registration and login
- Protected dashboard route
- Password reset flow
- MFA enrollment and verification
- Weather endpoint integration
- Map embed for location view
- Local SQLite database setup
- Laravel API and CORS configuration for local development

## Project structure

- frontend/ — Next.js application
- backend/ — Laravel REST API
- docs/ — architecture, API docs, deployment notes, security guidance, screenshots, and demo script

## Setup and references

- [Local setup](docs/local-setup.md)
- [REST API reference](docs/API.md)
- [System architecture diagram](docs/architecture.mmd)
- [Deployment instructions](docs/deployment.md)
- [Demo guide](docs/demo-guide.md)

## Local setup

### 1. Install runtime tools

Verify that Node.js, npm, Git, PHP 8.2+, and Composer are available.

Laravel requires PHP 8.2 or newer. On the current Windows machine the default `php` command resolves to XAMPP PHP 8.0.30, while PHP 8.2.33 is installed separately. Set `$php82` to the PHP 8.2 executable path and use it for Artisan commands, or correct PATH so PHP 8.2 is selected.

### 2. Frontend

```powershell
cd frontend
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

The frontend should run on http://127.0.0.1:3001.

### 3. Backend

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
$php82 = "C:\Path\To\PHP82\php.exe" # replace with your PHP 8.2 executable
& $php82 artisan key:generate
& $php82 artisan migrate
& $php82 artisan serve --host 127.0.0.1 --port 8000
```

The API should run on http://127.0.0.1:8000.

## Environment variable names used by the app

### Frontend

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### Backend

```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:3001
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:3001,127.0.0.1:3001
OPENWEATHER_API_KEY=your_openweather_api_key_here
MAIL_MAILER=log
```

The backend `.env.example` defaults to SQLite for local setup and includes the PostgreSQL variables to configure for Supabase. Do not use production database credentials in local documentation or commit `.env` files. Set `DB_CONNECTION=pgsql`, provider host/database/user/password, and required SSL mode in the backend environment for PostgreSQL.

## Backend endpoints

- POST /api/register
- POST /api/login
- POST /api/logout
- GET /api/user
- POST /api/forgot-password
- POST /api/reset-password
- GET /api/dashboard
- GET /api/weather
- POST /api/mfa/enable
- POST /api/mfa/verify
- POST /api/mfa/disable
- GET /api/health

## Verification

Run frontend lint and production build from `frontend`:

```powershell
npm run lint
npm run build
```

Run backend tests from `backend` with PHP 8.2 or newer:

```powershell
& $php82 artisan test
```

The Windows PHP 8.2 executable path is machine-specific. Set `$php82` to the correct executable before running the backend commands.

## Security notes

- Do not commit real `.env` or `.env.local` files.
- Keep private keys in backend environment variables only.
- Use secure cookies and CORS configuration for the local frontend host.
- MFA uses a TOTP secret and verification code.
- Disabling MFA requires the account password and a valid current TOTP code.
- Sensitive account, reset, and MFA endpoints are rate-limited.

## Demo

Use the script in [docs/demo-guide.md](docs/demo-guide.md) to walk through registration, login, dashboard access, weather, password reset, and MFA verification.

## Deployment status

This project is configured for local development validation. Production hosting credentials were not supplied, so no live Vercel or backend deployment has been claimed.
