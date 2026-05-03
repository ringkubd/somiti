<?php

namespace App\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFirstTimeSomitiCreation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for specific routes
        if ($request->routeIs('somitis.create', 'somitis.store', 'logout', 'auth.logout', 'password.*', 'profile.*')) {
            return $next($request);
        }

        // Only apply to authenticated users
        if (auth()->check()) {
            // If user has no Somitis, redirect to create one
            if (! auth()->user()->somitis()->exists() && ! $request->expectsJson()) {
                return redirect()->route('somitis.create');
            }
        }

        return $next($request);
    }
}
