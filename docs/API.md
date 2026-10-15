# REST API Reference

The API is served by Laravel under `/api`. First-party browser requests use Laravel Sanctum session cookies and must include the CSRF cookie returned by `GET /sanctum/csrf-cookie`. The Next.js `apiFetch` helper handles both cookies and the `X-XSRF-TOKEN` header.

Base URL for local development: `http://127.0.0.1:8000`

## Browser Session Setup

Before registration, login, or another state-changing request, the browser client must:

1. Request `GET /sanctum/csrf-cookie` with credentials enabled.
2. Read the `XSRF-TOKEN` cookie and URL-decode it for the `X-XSRF-TOKEN` request header.
3. Send requests with credentials enabled so the Laravel session cookie is retained.

The frontend's `src/lib/api.js` helper performs this handshake. Keep the frontend origin in Laravel's CORS and Sanctum stateful-domain configuration. Cross-origin production deployments must use HTTPS and compatible secure-cookie settings.

## Endpoints

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Backend health response. |
| POST | `/api/register` | Public | Create account and start a session. Six requests/minute/IP. |
| POST | `/api/login` | Public | Validate credentials; responds with `mfa_required` if TOTP is enabled. Six requests/minute/IP. |
| POST | `/api/mfa/challenge` | Pending login session | Verify login TOTP challenge. Six requests/minute/IP. |
| POST | `/api/forgot-password` | Public | Request a password-reset email, with a generic response. Six requests/minute/IP. |
| POST | `/api/reset-password` | Public | Consume a valid reset token and set a new password. Six requests/minute/IP. |
| GET | `/api/weather?city=London` | Public | Return normalized provider weather or a clear unconfigured/error status. |
| GET | `/api/user` | Authenticated | Return the current user without password or MFA secret. |
| GET | `/api/dashboard?city=London` | Authenticated | Return account and weather context. |
| POST | `/api/logout` | Authenticated | Invalidate the session and rotate its CSRF token. |
| POST | `/api/mfa/enable` | Authenticated | Generate TOTP enrollment secret and QR data. Six requests/minute/IP. |
| POST | `/api/mfa/verify` | Authenticated | Verify enrollment code and enable MFA. Six requests/minute/IP. |
| POST | `/api/mfa/disable` | Authenticated | Disable MFA after checking password and a fresh TOTP code. Six requests/minute/IP. |

## Request Examples

Register:

```http
POST /api/register
Content-Type: application/json
Accept: application/json

{
  "name": "Taylor Example",
  "email": "taylor@example.com",
  "password": "A-strong-password-123!",
  "password_confirmation": "A-strong-password-123!"
}
```

Login can return the authenticated user or an MFA challenge response:

```json
{
  "status": "mfa_required",
  "message": "Multi-factor authentication is required."
}
```

Submit a six-digit challenge with `POST /api/mfa/challenge`:

```json
{
  "code": "123456"
}
```

Weather:

```http
GET /api/weather?city=London
Accept: application/json
```

Successful weather data includes `city`, `country`, `temperature_celsius`, `feels_like_celsius`, `description`, `humidity`, and `wind_speed`. If no backend weather key is configured, the API returns `status: "not_configured"` rather than fabricated conditions.

Password reset uses Laravel's password broker. A reset link is delivered only when a mail provider is configured; local `MAIL_MAILER=log` writes the notification to the Laravel log. Recovery requests use the same response for registered and unknown email addresses. Reset tokens expire and cannot be reused.

## MFA Security

TOTP secrets are encrypted at rest. Enrollment is pending until a valid code is verified. The backend stores the last accepted TOTP time-step and rejects reuse. Disabling MFA requires both the current account password and a fresh authenticator code. Recovery codes are not implemented; users should retain access to their authenticator until a separate recovery process is provisioned.

## Errors

Validation failures use HTTP 422 with Laravel's JSON validation error structure. Authentication failures use HTTP 401; rate limits use HTTP 429. Weather provider configuration or upstream failures are represented with a normalized status and do not include provider credentials or raw exception details.

For the maintained endpoint notes, see [docs/api/api-endpoints.md](api/api-endpoints.md).
