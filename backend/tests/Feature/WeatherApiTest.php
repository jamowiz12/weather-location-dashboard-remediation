<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
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

        $response = $this->getJson('/api/weather?city=Paris');

        $response
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('city', 'Paris')
            ->assertJsonPath('country', 'FR')
            ->assertJsonPath('temperature_celsius', 18);

        Http::assertSent(fn ($request) => str_starts_with($request->url(), 'https://api.openweathermap.org/data/2.5/weather?')
            && $request['q'] === 'Paris'
            && $request['appid'] === 'test-key'
            && $request['units'] === 'metric');

        $this->assertStringNotContainsString('test-key', $response->getContent());
    }

    public function test_weather_endpoint_reports_an_invalid_city_without_exposing_provider_details(): void
    {
        config(['services.openweather.key' => 'test-key']);
        Http::fake([
            'api.openweathermap.org/*' => Http::response(['message' => 'city not found'], 404),
        ]);

        $this->getJson('/api/weather?city=NoSuchCity')
            ->assertOk()
            ->assertJsonPath('status', 'invalid_city')
            ->assertJsonPath('message', 'City not found. Check the spelling and try again.')
            ->assertJsonMissingPath('appid');
    }

    public function test_weather_endpoint_hides_provider_errors(): void
    {
        config(['services.openweather.key' => 'test-key']);
        Http::fake([
            'api.openweathermap.org/*' => Http::response(['message' => 'private provider detail'], 500),
        ]);

        $this->getJson('/api/weather?city=Paris')
            ->assertOk()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Weather information could not be loaded.')
            ->assertJsonMissing(['message' => 'private provider detail']);
    }

    public function test_weather_endpoint_handles_connection_failures_without_exposing_details(): void
    {
        config(['services.openweather.key' => 'test-key']);
        Http::fake(fn () => throw new ConnectionException('private transport detail'));

        $this->getJson('/api/weather?city=Paris')
            ->assertOk()
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Weather information could not be loaded. Please try again later.')
            ->assertJsonMissing(['message' => 'private transport detail']);
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