<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WeatherApiTest extends TestCase
{
    public function test_weather_endpoint_returns_provider_data_for_a_valid_city(): void
    {
        config(['services.openweather.key' => 'test-key']);
        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'name' => 'Paris',
                'sys' => ['country' => 'FR'],
                'main' => ['temp' => 18, 'feels_like' => 17, 'humidity' => 60],
                'weather' => [['description' => 'clear sky']],
                'wind' => ['speed' => 3.1],
            ]),
        ]);

        $this->getJson('/api/weather?city=Paris')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('city', 'Paris')
            ->assertJsonPath('country', 'FR')
            ->assertJsonPath('temperature_celsius', 18);

        Http::assertSent(fn ($request) => str_starts_with($request->url(), 'https://api.openweathermap.org/data/2.5/weather?')
            && $request['q'] === 'Paris'
            && $request['appid'] === 'test-key');
    }

    public function test_weather_endpoint_reports_missing_configuration_without_faking_data(): void
    {
        config(['services.openweather.key' => null]);

        $this->getJson('/api/weather?city=Paris')
            ->assertOk()
            ->assertJsonPath('status', 'not_configured')
            ->assertJsonPath('city', 'Paris');

        Http::assertNothingSent();
    }

    public function test_weather_endpoint_validates_city_length(): void
    {
        $this->getJson('/api/weather?city='.str_repeat('a', 101))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('city');
    }
}