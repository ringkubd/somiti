<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index()
    {
        $loans = \App\Models\Loan::with(['somiti', 'user'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Loans/Index', [
            'loans' => $loans,
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitiId = $request->query('somiti_id');

        $somitis = \App\Models\Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        return \Inertia\Inertia::render('Loans/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $somitiId ? (int) $somitiId : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:1',
            'interest_rate' => 'required|numeric|min:0',
            'duration_months' => 'required|integer|min:1',
            'purpose' => 'nullable|string',
        ]);

        $somiti = \App\Models\Somiti::findOrFail($request->somiti_id);
        $activeYear = $somiti->activeFinancialYear();

        if (! $activeYear) {
            return back()->withErrors(['somiti_id' => 'This society does not have an active financial year.']);
        }

        $loan = \App\Models\Loan::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $activeYear->id,
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'interest_rate' => $request->interest_rate,
            'duration_months' => $request->duration_months,
            'purpose' => $request->purpose,
            'status' => 'pending',
        ]);

        return redirect()->route('loans.show', $loan)->with('success', 'Loan request submitted for approval.');
    }

    public function show(\App\Models\Loan $loan)
    {
        // check access
        if (! $loan->somiti->users()->where('users.id', auth()->id())->exists() &&
            $loan->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Loans/Show', [
            'loan' => $loan->load(['somiti', 'user', 'financialYear', 'approver', 'approvals.user']),
        ]);
    }
}
