<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Show a placeholder (or 404) for two-factor if it's disabled.
     */
    public function show(Request $request): Response
    {
        if (! Features::enabled(Features::twoFactorAuthentication())) {
            abort(404);
        }

        // If feature ever enabled, render a basic placeholder page
        return Inertia::render('settings/two-factor', [
            'twoFactorEnabled' => false,
            'requiresConfirmation' => false,
        ]);
    }
}
