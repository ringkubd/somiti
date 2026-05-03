<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FinancialYearController extends Controller
{
    public function index()
    {
        $financialYears = \App\Models\FinancialYear::with(['somiti'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('FinancialYears/Index', [
            'financialYears' => $financialYears,
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitis = \App\Models\Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        return \Inertia\Inertia::render('FinancialYears/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $request->query('somiti_id') ? (int) $request->query('somiti_id') : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'title' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required|boolean',
            'share_value' => 'required|numeric|min:0',
        ]);

        if ($request->is_active) {
            \App\Models\FinancialYear::where('somiti_id', $request->somiti_id)->update(['is_active' => false]);
        }

        $financialYear = \App\Models\FinancialYear::create($request->all());

        return redirect()->route('financial-years.index')->with('success', 'Financial year created successfully.');
    }

    public function show(\App\Models\FinancialYear $financialYear)
    {
        // check access
        if (! $financialYear->somiti->users()->where('users.id', auth()->id())->exists() &&
            $financialYear->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('FinancialYears/Show', [
            'financialYear' => $financialYear->load(['somiti']),
        ]);
    }

    public function edit(\App\Models\FinancialYear $financialYear)
    {
        // check access
        if (! $financialYear->somiti->users()->where('users.id', auth()->id())->exists() &&
            $financialYear->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('FinancialYears/Edit', [
            'financialYear' => $financialYear->load(['somiti']),
        ]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\FinancialYear $financialYear)
    {
        // check access
        if (! $financialYear->somiti->users()->where('users.id', auth()->id())->exists() &&
            $financialYear->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'required|boolean',
            'share_value' => 'required|numeric|min:0',
        ]);

        if ($request->is_active && ! $financialYear->is_active) {
            \App\Models\FinancialYear::where('somiti_id', $financialYear->somiti_id)
                ->where('id', '!=', $financialYear->id)
                ->update(['is_active' => false]);
        }

        $financialYear->update($request->all());

        return redirect()->route('financial-years.index')->with('success', 'Financial year updated successfully.');
    }
}
