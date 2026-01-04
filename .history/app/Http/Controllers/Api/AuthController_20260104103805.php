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
        \Log::debug('AuthController.logout called', ['user' => $user?->id, 'bearer' => $request->bearerToken(), 'currentAccessToken' => $user?->currentAccessToken()?->id]);

        if ($user && $request->bearerToken()) {
            // delete current access token
            $user->currentAccessToken()?->delete();
        } else if ($user) {
            // delete all tokens
            $user->tokens()->delete();
        }

        return response()->json(['logged_out' => true]);
    }

    public function me(Request $request)
    {
        \Log::debug('AuthController.me called', ['user' => $request->user()?->id]);
        return response()->json($request->user());
    }
}
