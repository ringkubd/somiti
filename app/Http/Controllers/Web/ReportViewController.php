<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Services\AccountingService;
use Inertia\Inertia;

class ReportViewController extends Controller
{
    public function index()
    {
        if (! auth()->user()->isSuperAdmin()) {
            abort(403);
        }

        $somitis = Somiti::withCount('members')->get();

        return Inertia::render('Reports/Index', [
            'somitis' => $somitis->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'unique_code' => $s->unique_code,
                'currency_symbol' => $s->currency_symbol ?? '$',
                'members_count' => $s->members_count,
            ]),
        ]);
    }
}
