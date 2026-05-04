<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required_without:phone|string|email|max:255|unique:users',
            'phone' => 'required_without:email|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.required_without' => 'The email or phone field is required.',
            'phone.required_without' => 'The email or phone field is required.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email ?? null,
            'phone' => $request->phone ?? null,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required_without:phone|string',
            'phone' => 'required_without:login|string',
            'password' => 'required',
        ], [
            'login.required_without' => 'The email or phone field is required.',
            'phone.required_without' => 'The email or phone field is required.',
        ]);

        $credential = $request->input('login') ?? $request->input('phone');

        $user = User::where('phone', $credential)
            ->orWhere('email', $credential)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $valid = Hash::check($request->input('password'), $user->password);

        if (! $valid) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

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
        } elseif ($user) {
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

        // Ensure the token instance exists in DB (was not deleted)
        if (! $request->bearerToken() || ! ($accessToken instanceof \Laravel\Sanctum\PersonalAccessToken) || ! \Laravel\Sanctum\PersonalAccessToken::where('id', $accessToken->id)->exists()) {
            \Log::debug('AuthController.me denying access', ['bearer' => $request->bearerToken(), 'accessToken' => $accessToken]);

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'string|max:20|unique:users,phone,'.$user->id,
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated.']);
    }

    public function pushToken(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|string',
        ]);

        PushToken::updateOrCreate(
            ['user_id' => $user->id, 'token' => $validated['token']],
            ['platform' => $validated['platform'] ?? null]
        );

        return response()->json(['message' => 'Token registered.']);
    }
}
