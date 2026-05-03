<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Fdr;
use App\Models\Investment;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FdrController extends Controller
{
    public function index()
    {
        $fdrs = \App\Models\Fdr::with(['somiti', 'investment'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Fdrs/Index', [
            'fdrs' => $fdrs,
        ]);
    }

    public function show(\App\Models\Fdr $fdr)
    {
        // check access
        if (! $fdr->somiti->users()->where('users.id', auth()->id())->exists() &&
            $fdr->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Fdrs/Show', [
            'fdr' => $fdr->load(['somiti', 'investment']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitis = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        $investments = Investment::whereIn('somiti_id', $somitis->pluck('id'))
            ->where('status', 'approved')
            ->get(['id', 'type', 'amount']);

        return Inertia::render('Fdrs/Create', [
            'somitis' => $somitis,
            'investments' => $investments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'investment_id' => 'nullable|exists:investments,id',
            'bank_name' => 'required|string|max:150',
            'interest_rate' => 'required|numeric|min:0',
            'tenure_months' => 'required|integer|min:1',
            'maturity_amount' => 'nullable|numeric|min:0',
        ]);

        $fdr = Fdr::create($request->only([
            'somiti_id', 'investment_id', 'bank_name',
            'interest_rate', 'tenure_months', 'maturity_amount',
        ]));

        $fdr->requestApproval(auth()->id(), 'New FDR application.');

        return redirect()->route('fdrs.show', $fdr)->with('success', 'FDR submitted for approval.');
    }
}
