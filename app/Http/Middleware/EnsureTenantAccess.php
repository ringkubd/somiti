<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    /**
     * Validate that the somiti_id in the request belongs to the authenticated user.
     * This is a write-level tenant guard that prevents cross-tenant data creation.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Check if the request contains a somiti_id parameter
        $somitiId = $request->route('somiti_id')
            ?? $request->input('somiti_id')
            ?? $request->query('somiti_id');

        if ($somitiId) {
            $hasAccess = $user->isOwnerOfSomiti($somitiId)
                || $user->isManagerOfSomiti($somitiId)
                || $user->isMemberOfSomiti($somitiId);

            if (! $hasAccess) {
                abort(403, 'You do not have access to this somiti.');
            }
        }

        // For route model binding, check the model's somiti
        $routeParams = $request->route()->parameters();
        foreach ($routeParams as $param) {
            if (is_object($param) && isset($param->somiti_id)) {
                $hasAccess = $user->isOwnerOfSomiti($param->somiti_id)
                    || $user->isManagerOfSomiti($param->somiti_id)
                    || $user->isMemberOfSomiti($param->somiti_id);

                if (! $hasAccess) {
                    abort(403, 'You do not have access to this resource.');
                }
            }
        }

        return $next($request);
    }
}
