<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct(Google2FA $google2fa)
    {
        $this->google2fa = $google2fa;
    }

    public function enable(Request $request)
    {
        $user = $request->user();

        if ($user->mfa_enabled) {
            return response()->json([
                'message' => 'MFA is already enabled for this account.',
            ], 409);
        }

        $secret = $this->google2fa->generateSecretKey();
        $provisioningUri = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );
        $renderer = new ImageRenderer(new RendererStyle(220), new SvgImageBackEnd());
        $qrCode = (new Writer($renderer))->writeString($provisioningUri);

        $user->forceFill([
            'mfa_secret' => $secret,
            'mfa_enabled' => false,
            'mfa_last_used_at' => null,
        ])->save();

        return response()->json([
            'message' => 'Scan the QR code with your authenticator app, then verify a code to enable MFA.',
            'secret' => $secret,
            'qr_code_data_uri' => 'data:image/svg+xml;base64,'.base64_encode($qrCode),
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if (! $user || ! $user->mfa_secret) {
            return response()->json([
                'message' => 'MFA setup is not available for this account.',
            ], 401);
        }

        if (! $this->verifyNewCode($user, $validated['code'])) {
            return response()->json([
                'message' => 'The MFA code is invalid.',
            ], 401);
        }

        $user->mfa_enabled = true;
        $user->save();

        return response()->json([
            'message' => 'MFA has been enabled.',
            'user' => $user->makeHidden(['password', 'mfa_secret']),
        ]);
    }

    public function verifyLoginChallenge(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $userId = $request->session()->get('pending_mfa_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user || ! $user->mfa_enabled || ! $user->mfa_secret) {
            return response()->json([
                'message' => 'A valid MFA login challenge is required.',
            ], 401);
        }

        if (! $this->verifyNewCode($user, $validated['code'])) {
            return response()->json([
                'message' => 'The MFA code is invalid.',
            ], 401);
        }

        Auth::login($user);
        $request->session()->forget('pending_mfa_user_id');
        $request->session()->regenerate();

        return response()->json([
            'message' => 'MFA verification successful.',
            'user' => $user->makeHidden(['password', 'mfa_secret']),
        ]);
    }

    public function disable(Request $request)
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
            'code' => ['required', 'string', 'digits:6'],
        ]);
        $user = $request->user();

        if (! $user->mfa_enabled || ! $user->mfa_secret) {
            return response()->json([
                'message' => 'MFA is not enabled for this account.',
            ], 409);
        }

        if (! Hash::check($validated['password'], $user->password)
            || ! $this->verifyNewCode($user, $validated['code'])) {
            return response()->json([
                'message' => 'The password or MFA code is invalid.',
            ], 401);
        }

        $user->mfa_secret = null;
        $user->mfa_enabled = false;
        $user->save();

        return response()->json([
            'message' => 'MFA has been disabled.',
        ]);
    }

    private function verifyNewCode(User $user, string $code): bool
    {
        $timestamp = $this->google2fa->verifyKeyNewer(
            $user->mfa_secret,
            $code,
            $user->mfa_last_used_at ?? 0
        );

        if (! is_int($timestamp)) {
            return false;
        }

        $user->forceFill(['mfa_last_used_at' => $timestamp])->save();

        return true;
    }
}
