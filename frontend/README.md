# Weather and Location Dashboard Frontend

This Next.js App Router application provides registration, login, dashboard, password recovery, and MFA screens. It calls the Laravel API using Sanctum session cookies; browser requests obtain the CSRF cookie before sending state-changing requests.

## Local development

From PowerShell:

```powershell
Set-Location 'C:\Users\Jamowiz\WeatherLocationDashboard\frontend'
if (-not (Test-Path '.env.local')) { Copy-Item '.env.example' '.env.local' }
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open `http://127.0.0.1:3001`. Start the Laravel API separately on `http://127.0.0.1:8000`; the frontend's local API URL is set by `NEXT_PUBLIC_API_URL` in `.env.local`. A Google Maps Embed key is optional and browser-visible, so restrict it to the intended API and frontend origins.

Do not overwrite an existing `.env.local`. Never put backend-only weather, mail, or database secrets in `NEXT_PUBLIC_` variables.

## Validation

```powershell
npm run lint
npm run build
```

## Related project guides

- [Full project setup](../docs/local-setup.md)
- [API contract](../docs/API.md)
- [Architecture](../docs/architecture/architecture.md)
- [Deployment](../docs/deployment.md)
