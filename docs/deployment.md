# Deployment notes

This project is set up for local development validation and has not yet been deployed to production. No Vercel project, Laravel hosting account, or production credentials were provided.

## Recommended deployment split

- Frontend: Vercel
- Backend: a PHP-compatible Laravel host such as Render, Railway, Fly.io, or a managed VPS with PHP 8.2+
- Database: PostgreSQL via Supabase or another approved managed provider
- External services: OpenWeather API, Google Maps, and a provider for email delivery

## Frontend deployment

- Root directory: `frontend`
- Production build command: `npm run build`
- Output directory: `.next` (default Next.js build output)
- Required frontend variables:
	- `NEXT_PUBLIC_API_URL`
	- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

The Google Maps key is intentionally delivered to the browser. Restrict it to the required Maps Embed API and deployed frontend referrers; never put private service credentials in `NEXT_PUBLIC_` variables.

For production, the frontend must call the deployed backend URL instead of `http://127.0.0.1:8000`.

## Backend deployment

- Root directory: `backend`
- Runtime requirement: PHP 8.2+
- Typical Laravel startup command: `php artisan serve` for evaluation, or equivalent host-managed process for production
- Required backend variables:
	- `APP_ENV=production`
	- `APP_DEBUG=false`
	- `APP_URL=https://<your-backend-domain>`
	- `FRONTEND_URL=https://<your-frontend-domain>`
	- `SANCTUM_STATEFUL_DOMAINS=<frontend-domain>`
	- `SESSION_SECURE_COOKIE=true`
	- `OPENWEATHER_API_KEY`
	- `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, and `MAIL_FROM_NAME` for SMTP or the selected mail provider
	- A stable `APP_KEY`; encrypted MFA secrets depend on it. Use `APP_PREVIOUS_KEYS` only for a planned key rotation.
	- `DB_CONNECTION=pgsql` for PostgreSQL
	- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
	- `DB_SSLMODE=require` when required by the PostgreSQL provider

## Database readiness

The example environment uses SQLite for local development. The current workspace is configured for PostgreSQL; a read-only connection probe and migration-status check succeeded. This does not verify the database credentials configured on a separate production host. Set `DB_CONNECTION=pgsql` and the provider's `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and SSL mode in the backend environment.

Production steps:

1. Create a PostgreSQL database in the selected provider.
2. Set the backend database variables in the host environment.
3. Back up the database and review pending migrations, including the migration that encrypts existing MFA secrets.
4. Run `php artisan migrate --force` only after confirming the provider and credentials are correct and receiving explicit approval.
5. Ensure the application is not pointed at any shared or staging database without authorization.

## CORS and cookie requirements

- The backend must allow the deployed frontend origin in `config/cors.php`.
- `SANCTUM_STATEFUL_DOMAINS` must include the production domain used by the frontend.
- Sanctum session authentication requires the frontend and API to share a site. Prefer custom sibling domains such as `app.example.com` and `api.example.com`; set `SESSION_DOMAIN=.example.com`, include the frontend host in `SANCTUM_STATEFUL_DOMAINS`, allow its exact HTTPS origin in CORS, and use `SESSION_SECURE_COOKIE=true` with `SESSION_SAME_SITE=lax`. A Vercel default domain paired with an unrelated backend-host domain is cross-site and browser cookie restrictions can prevent login from working reliably.
- `FRONTEND_URL` is used to create password-reset links and is included in the CORS origin allowlist.

## Health and verification

- Local health check: `GET /api/health`
- Production verification should check the same endpoint after deployment.
- Use browser and API checks to confirm session auth and MFA pages work on HTTPS.

## Security restrictions

- Never place private API keys in the frontend repository or public environment variables.
- OpenWeather and mail credentials are backend-only. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is browser-visible and must be restricted in Google Cloud.
- Keep backend secrets on the host provider’s secret store.
- Never claim deployment success until the live URL responds and the configured auth flow is verified.
