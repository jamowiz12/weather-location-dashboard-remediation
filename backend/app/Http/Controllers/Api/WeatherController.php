<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'city' => ['sometimes', 'required', 'string', 'max:100'],
        ]);
        $city = $validated['city'] ?? 'London';

        return response()->json($this->fetchWeather($city));
    }

    public function fetchWeather(string $city): array
    {
        $apiKey = config('services.openweather.key');

        if (! $apiKey) {
            return [
                'status' => 'not_configured',
                'message' => 'Weather API key is not configured. Add OPENWEATHER_API_KEY to your backend .env file.',
                'city' => $city,
            ];
        }

        try {
            $response = Http::timeout(10)->get('https://api.openweathermap.org/data/2.5/weather', [
                'q' => $city,
                'appid' => $apiKey,
                'units' => 'metric',
            ]);
        } catch (ConnectionException) {
            return [
                'status' => 'error',
                'message' => 'Weather information could not be loaded. Please try again later.',
                'city' => $city,
            ];
        }

        if (! $response->successful()) {
            return [
                'status' => 'error',
                'message' => 'Weather information could not be loaded.',
                'city' => $city,
            ];
        }

        $payload = $response->json();

        return [
            'status' => 'success',
            'city' => $payload['name'] ?? $city,
            'country' => $payload['sys']['country'] ?? 'Unknown',
            'temperature_celsius' => $payload['main']['temp'] ?? null,
            'feels_like_celsius' => $payload['main']['feels_like'] ?? null,
            'description' => $payload['weather'][0]['description'] ?? 'No description available',
            'humidity' => $payload['main']['humidity'] ?? null,
            'wind_speed' => $payload['wind']['speed'] ?? null,
        ];
    }
}
