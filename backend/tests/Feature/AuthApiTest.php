<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Alex User',
            'email' => 'alex@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'alex@example.com');
    }

    public function test_registration_works_with_database_backed_sessions(): void
    {
        config(['session.driver' => 'database']);

        $this->postJson('/api/register', [
            'name' => 'Session User',
            'email' => 'session@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ])->assertCreated();

        $this->assertDatabaseHas('sessions', [
            'user_id' => User::where('email', 'session@example.com')->value('id'),
        ]);
    }

    public function test_user_can_login_after_register(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Sam User',
            'email' => 'sam@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'sam@example.com',
            'password' => 'StrongPass123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'sam@example.com');
    }

    public function test_mfa_login_requires_and_accepts_a_valid_challenge(): void
    {
        $secret = app(Google2FA::class)->generateSecretKey();
        User::factory()->create([
            'email' => 'mfa@example.com',
            'password' => 'StrongPass123!',
            'mfa_secret' => $secret,
            'mfa_enabled' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'mfa@example.com',
            'password' => 'StrongPass123!',
        ])->assertOk()->assertJsonPath('status', 'mfa_required');

        $this->postJson('/api/mfa/challenge', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])->assertOk()->assertJsonPath('user.email', 'mfa@example.com');

        $this->getJson('/api/dashboard')->assertOk();

        $this->postJson('/api/login', [
            'email' => 'mfa@example.com',
            'password' => 'StrongPass123!',
        ])->assertOk()->assertJsonPath('status', 'mfa_required');

        $this->postJson('/api/mfa/challenge', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])->assertUnauthorized();
    }

    public function test_mfa_challenge_cannot_authenticate_without_a_pending_login(): void
    {
        $this->postJson('/api/mfa/challenge', ['code' => '123456'])
            ->assertUnauthorized();
    }

    public function test_mfa_secret_is_encrypted_in_the_database(): void
    {
        $secret = app(Google2FA::class)->generateSecretKey();
        $user = User::factory()->create(['mfa_secret' => $secret]);

        $this->assertNotSame($secret, DB::table('users')->where('id', $user->id)->value('mfa_secret'));
        $this->assertSame($secret, $user->fresh()->mfa_secret);
    }

    public function test_mfa_login_rejects_an_invalid_challenge_code(): void
    {
        $secret = app(Google2FA::class)->generateSecretKey();
        User::factory()->create([
            'email' => 'mfa@example.com',
            'password' => 'StrongPass123!',
            'mfa_secret' => $secret,
            'mfa_enabled' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'mfa@example.com',
            'password' => 'StrongPass123!',
        ])->assertOk()->assertJsonPath('status', 'mfa_required');

        $this->postJson('/api/mfa/challenge', ['code' => '000000'])
            ->assertUnauthorized();

        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_disabling_mfa_requires_the_current_password_and_authenticator_code(): void
    {
        $secret = app(Google2FA::class)->generateSecretKey();
        $user = User::factory()->create([
            'password' => 'StrongPass123!',
            'mfa_secret' => $secret,
            'mfa_enabled' => true,
        ]);
        $code = app(Google2FA::class)->getCurrentOtp($secret);

        $this->actingAs($user)->postJson('/api/mfa/disable', [])->assertUnprocessable();
        $this->actingAs($user)->postJson('/api/mfa/disable', [
            'password' => 'WrongPass123!',
            'code' => $code,
        ])->assertUnauthorized();
        $this->actingAs($user)->postJson('/api/mfa/disable', [
            'password' => 'StrongPass123!',
            'code' => '000000',
        ])->assertUnauthorized();

        $this->actingAs($user)->postJson('/api/mfa/disable', [
            'password' => 'StrongPass123!',
            'code' => $code,
        ])->assertOk();

        $this->assertFalse($user->fresh()->mfa_enabled);
        $this->assertNull($user->fresh()->mfa_secret);
    }

    public function test_password_reset_token_can_only_be_used_once(): void
    {
        $user = User::factory()->create(['password' => 'OriginalPass123!']);
        $token = Password::createToken($user);
        $payload = [
            'email' => $user->email,
            'token' => $token,
            'password' => 'UpdatedPass123!',
            'password_confirmation' => 'UpdatedPass123!',
        ];

        $this->postJson('/api/reset-password', $payload)
            ->assertOk()
            ->assertJsonPath('status', Password::PASSWORD_RESET);

        $this->assertTrue(password_verify('UpdatedPass123!', $user->fresh()->password));
        $this->postJson('/api/reset-password', $payload)->assertBadRequest();
    }

    public function test_password_recovery_response_does_not_reveal_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/forgot-password', ['email' => 'unknown@example.com']);

        $response->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link will be sent.');
        Notification::assertNothingSent();
    }
}
