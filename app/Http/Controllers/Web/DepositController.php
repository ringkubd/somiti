<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    public function index()
    {
        $deposits = \App\Models\Deposit::with(['somiti', 'user'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Deposits/Index', [
            'deposits' => $deposits,
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitiId = $request->query('somiti_id');

        $somitis = \App\Models\Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        return \Inertia\Inertia::render('Deposits/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $somitiId ? (int) $somitiId : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:savings,share,fdr,other',
            'month' => 'nullable|string',
        ]);

        $somiti = \App\Models\Somiti::findOrFail($request->somiti_id);
        $activeYear = $somiti->activeFinancialYear();

        if (! $activeYear) {
            return back()->withErrors(['somiti_id' => 'This society does not have an active financial year.']);
        }

        $deposit = \App\Models\Deposit::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $activeYear->id,
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'type' => $request->type,
            'month' => $request->month ?: now()->format('F Y'),
            'status' => 'pending',
        ]);

        // Request approval from the Somiti creator (the admin)
        $deposit->requestApproval($somiti->created_by_user_id, 'New deposit submission.');

        return redirect()->route('deposits.show', $deposit)->with('success', 'Deposit request submitted for approval.');
    }

    public function show(\App\Models\Deposit $deposit)
    {
        // check access
        if (! $deposit->somiti->users()->where('users.id', auth()->id())->exists() &&
            $deposit->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Deposits/Show', [
            'deposit' => $deposit->load(['somiti', 'user', 'financialYear', 'approver', 'approvals.user']),
        ]);
    }
}
