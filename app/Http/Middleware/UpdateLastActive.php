<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdateLastActive
{
    /**
     * Throttle writes: only persist once per minute per user.
     */
    private static array $updatedAt = [];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (Auth::check()) {
            $user = Auth::user();
            $key = (string) $user->id;
            $now = time();

            if (! isset(self::$updatedAt[$key]) || $now - self::$updatedAt[$key] >= 60) {
                self::$updatedAt[$key] = $now;
                $user->forceFill(['last_active_at' => now()])->saveQuietly();
            }
        }

        return $response;
    }
}
