<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FinancialYear;
use App\Models\Investment;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    public function index()
    {
        $investments = \App\Models\Investment::with(['somiti'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Investments/Index', [
            'investments' => $investments,
        ]);
    }

    public function show(\App\Models\Investment $investment)
    {
        // check access
        if (! $investment->somiti->users()->where('users.id', auth()->id())->exists() &&
            $investment->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Investments/Show', [
            'investment' => $investment->load(['somiti', 'financialYear', 'approver', 'approvals.user', 'fdrs']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitis = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        $financialYears = FinancialYear::whereIn('somiti_id', $somitis->pluck('id'))
            ->orderBy('start_date', 'desc')
            ->get(['id', 'title']);

        return Inertia::render('Investments/Create', [
            'somitis' => $somitis,
            'financialYears' => $financialYears,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'financial_year_id' => 'required|exists:financial_years,id',
            'type' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'start_date' => 'nullable|date',
            'maturity_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $investment = Investment::create(array_merge(
            $request->only(['somiti_id', 'financial_year_id', 'type', 'amount', 'start_date', 'maturity_date']),
            ['user_id' => auth()->id(), 'status' => 'pending']
        ));

        $investment->requestApproval(auth()->id(), 'New investment application.');

        return redirect()->route('investments.show', $investment)->with('success', 'Investment submitted for approval.');
    }
}
