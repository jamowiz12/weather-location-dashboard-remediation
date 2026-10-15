# API endpoints

This document lists the currently implemented API surface for the local and production-ready app flow.

## Public endpoints

### POST /api/register
- Creates a new user account.
- Validates name, email, password, and confirmation.
- Returns user JSON and status 201.
- Limited to six requests per minute per client IP.

### POST /api/login
- Validates email and password.
- Returns 401 for invalid credentials.
- Returns MFA-required state when MFA is enabled.
- Limited to six requests per minute per client IP.

### POST /api/forgot-password
- Sends a password reset link using Laravel's reset flow.
- Returns the same generic message whether or not the email is registered.
- The link points to `FRONTEND_URL/reset-password`; actual email delivery requires a configured mail provider.
- Limited to six requests per minute per client IP.

### POST /api/reset-password
- Validates the reset token and password confirmation.
- Updates the password when the token is valid.
- Limited to six requests per minute per client IP; successful reset tokens cannot be reused.

### GET /api/health
- Returns a backend health response.

### GET /api/weather
- Returns weather information for a city when configured.
- Returns a not_configured status when `OPENWEATHER_API_KEY` is missing.
- Validates the city query parameter and does not expose provider error details.

## Protected endpoints

### GET /api/user
- Returns the currently authenticated user.

### POST /api/logout
- Invalidates the session and returns success.

### GET /api/dashboard
- Returns authenticated dashboard data and weather context.

### POST /api/mfa/enable
- Creates a TOTP secret for the current user.
- Limited to six requests per minute per client IP.

### POST /api/mfa/verify
- Validates an enrollment code for the authenticated user.
- Limited to six requests per minute per client IP.
- Each accepted TOTP time-step is stored and cannot be reused.

### POST /api/mfa/challenge
- Validates a login code only when the session has a pending MFA challenge; attempts are rate-limited.
- A previously accepted TOTP time-step is rejected.

### POST /api/mfa/disable
- Requires the current password and a valid authenticator code before disabling MFA.
- Limited to six requests per minute per client IP.
- The code must not have been accepted previously.

## Verification status

Feature tests cover registration, login, MFA challenge and disable flows, encrypted MFA-secret storage, password-reset token use and generic recovery responses, and weather-provider responses. PHP 8.2.33 is installed and Laravel tests must be run with that interpreter explicitly because the default `php` command resolves to PHP 8.0.30. Production deployment remains unverified because hosting and provider credentials are not configured.
