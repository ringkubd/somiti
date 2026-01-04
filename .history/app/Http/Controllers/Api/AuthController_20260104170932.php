<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('phone', $request->input('phone'))->first();

        if (! $user) {
            \Log::debug('AuthController.login: user not found', ['phone' => $request->input('phone')]);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $valid = Hash::check($request->input('password'), $user->password);
        \Log::debug('AuthController.login: password check', ['phone' => $request->input('phone'), 'valid' => $valid]);

        if (! $valid) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        \Log::debug('AuthController.logout called', ['user' => $user?->id, 'bearer' => $request->bearerToken(), 'currentAccessToken' => $user?->currentAccessToken()?->id, 'tokens_count' => $user?->tokens()->count()]);

        if ($user && $request->bearerToken()) {
            $current = $user->currentAccessToken();
            if ($current) {
                \Log::debug('AuthController.logout deleting current token', ['token_id' => $current->id]);
                $deleted = $current->delete();
                \Log::debug('AuthController.logout deletion result', ['deleted' => $deleted]);
            } else {
                \Log::debug('AuthController.logout no currentAccessToken found');
            }
        } else if ($user) {
            // delete all tokens
            $deleted = $user->tokens()->delete();
            \Log::debug('AuthController.logout deleted all tokens', ['deleted' => $deleted]);
        }

        // Log tokens after deletion
        \Log::debug('AuthController.logout tokens after deletion', ['tokens_count' => $user?->tokens()->count()]);

        // Ensure session-based authentication is also logged out (testing may persist session auth)
        try {
            Auth::guard('web')->logout();
            $request->session()?->invalidate();
            $request->session()?->regenerateToken();
            \Log::debug('AuthController.logout session invalidated');
        } catch (\Exception $e) {
            \Log::debug('AuthController.logout session invalidation failed', ['error' => $e->getMessage()]);
        }

        return response()->json(['logged_out' => true]);
    }

    public function me(Request $request)
    {
        \Log::debug('AuthController.me called', ['user' => $request->user()?->id, 'bearer' => $request->bearerToken(), 'tokens_count_db' => $request->user()?->tokens()->count()]);

        // Enforce token-based auth for this API endpoint: if there's no bearer token or the
        // current access token is missing (revoked), respond with 401. This prevents session
        // auth from accidentally allowing access during tests or elsewhere.
        $accessToken = $request->user()?->currentAccessToken();
        \Log::debug('AuthController.me access token present', ['accessToken_class' => is_object($accessToken) ? get_class($accessToken) : gettype($accessToken)]);

        if ($accessToken instanceof \Laravel\Sanctum\PersonalAccessToken) {
            \Log::debug('AuthController.me access token details', ['id' => $accessToken->id, 'exists_in_db' => \Laravel\Sanctum\PersonalAccessToken::where('id', $accessToken->id)->exists()]);
        }

        if (! $request->bearerToken() || ! ($accessToken instanceof \Laravel\Sanctum\PersonalAccessToken)) {
            \Log::debug('AuthController.me denying access', ['bearer' => $request->bearerToken(), 'accessToken' => $accessToken]);
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json($request->user());
    }
}
