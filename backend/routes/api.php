<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MfaController;
use App\Http\Controllers\Api\WeatherController;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::middleware(['web', EnsureFrontendRequestsAreStateful::class])->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    Route::post('/mfa/challenge', [MfaController::class, 'verifyLoginChallenge'])->middleware('throttle:6,1');
    Route::get('/health', [DashboardController::class, 'health']);
    Route::get('/weather', [WeatherController::class, 'index']);
});

Route::middleware(['web', EnsureFrontendRequestsAreStateful::class, 'auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/mfa/enable', [MfaController::class, 'enable'])->middleware('throttle:6,1');
    Route::post('/mfa/verify', [MfaController::class, 'verify'])->middleware('throttle:6,1');
    Route::post('/mfa/disable', [MfaController::class, 'disable'])->middleware('throttle:6,1');
});
