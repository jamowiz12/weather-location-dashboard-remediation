# Security notes

## Authentication

- Laravel sessions and Sanctum are used for first-party API authentication.
- Passwords are hashed by Laravel before they are stored, and login/register rotate the session ID.
- Protected routes require the authenticated session.
- Logout invalidates the session and rotates the CSRF token.

## MFA

- MFA uses TOTP codes. Login challenges are separate from authenticated enrollment and require a pending MFA session; challenge attempts are rate-limited.
- MFA secrets are encrypted using Laravel's application key. The included migration converts existing plaintext values and expands the column for ciphertext; back up the database and preserve `APP_KEY` before applying it.
- Accepted TOTP time-steps are persisted so an authenticator code cannot be reused for another enrollment, login challenge, or MFA disable action.
- Disabling MFA requires both the current account password and a fresh authenticator code.
- MFA QR codes are generated locally by the backend. The setup secret is shown only to the signed-in user configuring MFA.
- Enrollment is complete only after the user verifies a code. The MFA and authentication feature tests pass under the installed PHP 8.2.33 runtime.
- Registration, login, password recovery, and MFA endpoints are rate-limited.

## Environment handling

- Secrets remain in `.env` files, never committed to Git.
- Public browser keys are limited to frontend-safe values only.
- Private API keys remain on the backend server.
- `NEXT_PUBLIC_` variables must never contain secrets.

## CORS and cookies

- Local origins are explicit; the configured `FRONTEND_URL` is also added to the CORS allowlist.
- Cookie-based authentication works only when the frontend origin is included in the backend stateful domain policy.
- HTTPS-only secure cookies must be enabled in production, with matching Sanctum domains and SameSite policy for the chosen host topology.

## Deployment blockers

- The default Windows `php` command still resolves to PHP 8.0.30; use the installed PHP 8.2.33 executable explicitly or optionally correct PATH.
- Production deployment is blocked until the hosting provider, database, and credentials are configured.
- No live API keys or provider credentials were entered into the repository.
- The default `MAIL_MAILER=log` writes reset messages to application logs; it does not deliver email. Configure a real mail provider before relying on password reset outside local development.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is visible to browsers by design; restrict it to the required Maps API and allowed website referrers. OpenWeather and mail credentials remain private backend settings.
