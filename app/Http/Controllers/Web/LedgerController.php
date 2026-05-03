<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function index()
    {
        $ledgers = \App\Models\Ledger::with(['somiti', 'reference'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(30);

        return \Inertia\Inertia::render('Ledgers/Index', [
            'ledgers' => $ledgers,
        ]);
    }

    public function show(\App\Models\Ledger $ledger)
    {
        // check access
        if (! $ledger->somiti->users()->where('users.id', auth()->id())->exists() &&
            $ledger->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Ledgers/Show', [
            'ledger' => $ledger->load(['somiti', 'reference']),
        ]);
    }
}
