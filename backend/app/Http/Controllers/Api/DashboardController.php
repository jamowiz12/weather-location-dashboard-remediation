<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function health()
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'weather-location-dashboard-backend',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'city' => ['sometimes', 'required', 'string', 'max:100'],
        ]);
        $city = $validated['city'] ?? 'London';

        $weather = app(WeatherController::class)->fetchWeather($city);

        return response()->json([
            'message' => 'Welcome back.',
            'user' => $request->user()->makeHidden(['password', 'mfa_secret']),
            'location' => [
                'city' => $city,
                'country' => $weather['country'] ?? null,
            ],
            'weather' => $weather,
        ]);
    }
}
