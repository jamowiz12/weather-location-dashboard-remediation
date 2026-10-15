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

### Render Docker service

The repository includes a Render Blueprint at `render.yaml` and a production Docker image in `backend/Dockerfile`. In Render, create a Blueprint from this GitHub repository and review the service named `weather-location-dashboard-api`. If creating a Web Service manually instead, select **Docker**, set the Dockerfile path to `backend/Dockerfile`, set the Docker build context to `backend`, and set the health-check path to `/api/health`.

The image uses PHP 8.2 with Apache, Composer production dependencies, `pdo_pgsql`, cURL, and mbstring. Apache serves Laravel's `public/` directory and binds to Render's runtime `PORT` (defaulting to `10000` only for local container runs). HTTPS is terminated by Render; outbound cURL certificate verification stays enabled with system CA certificates. The image excludes all `.env*` files, Composer auth files, local `vendor/`, and local storage. The startup script refuses to start without `APP_KEY`, with non-production `APP_ENV`, or with `APP_DEBUG` enabled. It does not generate an application key or run database migrations.

The Blueprint prompts for values marked `sync: false`. Add them through Render's secure environment-variable form; never add actual values to `render.yaml`, Docker build arguments, or the repository. Required production configuration includes:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://<your-backend-domain>`
- `FRONTEND_URL=https://<your-frontend-domain>`
- `APP_KEY=<the existing backend APP_KEY; preserve it for encrypted MFA data>`
- `SANCTUM_STATEFUL_DOMAINS=<frontend-hostname, without scheme>`
- `SESSION_DOMAIN=.<shared-custom-domain>`
- `SESSION_DRIVER=database`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`
- `DB_CONNECTION=pgsql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `DB_SSLMODE=require`
- `OPENWEATHER_API_KEY`

Set the Supabase host, database, username, password, and port from its connection details. Use a supported connection mode/port and require TLS with `DB_SSLMODE=require`. The container has PostgreSQL PDO support. Do not change the schema or run migrations as part of the image startup. Check `php artisan migrate:status` against the intended production database first; take a backup and review every pending migration. Only then, run `php artisan migrate --force` as a deliberate one-off operation after approval.

Configure SMTP separately in Render (`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, and `MAIL_FROM_NAME`) before relying on password-reset delivery. Keep the mail password secret.

## Database readiness

The example environment uses SQLite for local development. The current workspace is configured for PostgreSQL; a read-only connection probe and migration-status check succeeded. This does not verify the database credentials configured on a separate production host.

Production steps:

1. Confirm the intended Supabase project and database before copying its connection settings to Render.
2. Back up the database and review pending migrations, including the migration that encrypts existing MFA secrets.
3. Run `php artisan migrate --force` only as a separately approved one-off action after confirming the provider and credentials are correct.
4. Ensure the application is not pointed at any shared or staging database without authorization.

## CORS and cookie requirements

- The backend must allow the deployed frontend origin in `config/cors.php`.
- `SANCTUM_STATEFUL_DOMAINS` must include the production domain used by the frontend.
- Sanctum session authentication requires the frontend and API to share a site. Prefer custom sibling domains such as `app.example.com` and `api.example.com`; set `SESSION_DOMAIN=.example.com`, include the frontend host in `SANCTUM_STATEFUL_DOMAINS`, allow its exact HTTPS origin in CORS, and use `SESSION_SECURE_COOKIE=true` with `SESSION_SAME_SITE=lax`. A Vercel default domain paired with an unrelated backend-host domain is cross-site and browser cookie restrictions can prevent login from working reliably.
- `FRONTEND_URL` is used to create password-reset links and is included in the CORS origin allowlist.
- Deploy the backend first. After Render assigns its URL, set `APP_URL`; once the Vercel URL and custom shared domain are known, set `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, and the exact CORS origin, then redeploy and verify browser cookie login over HTTPS.

## Health and verification

- Local health check: `GET /api/health`
- Production verification should check the same endpoint after deployment.
- Use browser and API checks to confirm session auth and MFA pages work on HTTPS.

## Security restrictions

- Never place private API keys in the frontend repository or public environment variables.
- OpenWeather and mail credentials are backend-only. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is browser-visible and must be restricted in Google Cloud.
- Keep backend secrets on the host provider’s secret store.
- Never claim deployment success until the live URL responds and the configured auth flow is verified.
