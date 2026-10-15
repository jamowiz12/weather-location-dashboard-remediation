# Demo guide

## 1. Frontend and backend startup

Start the backend with the supported PHP 8.2 runtime:

```powershell
cd backend
"C:\Users\Jamowiz\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" artisan serve --host 127.0.0.1 --port 8000
```

Start the frontend:

```powershell
cd frontend
npm run dev -- --hostname 127.0.0.1 --port 3001
```

## 2. Registration

Open http://127.0.0.1:3001/register and create an account.

## 3. Login

Open http://127.0.0.1:3001/login and sign in with the same account.

## 4. Protected dashboard

After login, the user lands on the dashboard, which displays profile data, weather information, and a map.

## 5. Password recovery

Go to the forgot-password page, submit an email, and review the Laravel log or configured mail provider for the reset link.

## 6. MFA

Visit the security page and generate the MFA QR code. Scan it with an authenticator app and verify the code.
For the security demonstration, log out and sign in again to show the MFA challenge. The same accepted six-digit time-step cannot be replayed. Disabling MFA requires both the account password and a fresh authenticator code.

## 7. Security discussion

This project demonstrates the full path from frontend input, backend validation, database persistence, MFA verification, and weather access.

In simple terms, the Next.js forms send JSON requests through the shared API client; Laravel validates those requests, performs the account or weather operation, and returns JSON. Sanctum keeps browser authentication in session cookies. Laravel stores the user and encrypted MFA secret in the configured database, while OpenWeather is called from the backend so its API key stays private.

## 8. Troubleshooting

- If login fails, check the Laravel server output for validation or session errors.
- If the weather API does not return data, verify the backend `OPENWEATHER_API_KEY` value.
- If the terminal still resolves PHP 8.0.30, correct the Windows PATH before running Laravel commands without the explicit executable path.

## 9. Verified screenshots

The current project includes screenshots in the docs folder for the registration, login, and dashboard views:

- [docs/screenshots/register.png](docs/screenshots/register.png)
- [docs/screenshots/login.png](docs/screenshots/login.png)
- [docs/screenshots/dashboard.png](docs/screenshots/dashboard.png)
