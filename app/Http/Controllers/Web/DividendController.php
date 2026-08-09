<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\DividendDeclaration;
use App\Models\Somiti;
use App\Services\DividendService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DividendController extends Controller
{
    /**
     * List dividend declarations for a somiti.
     */
    public function index(Somiti $somiti)
    {
        if (! Auth::user()->can('view', $somiti)) {
            abort(403);
        }

        $declarations = $somiti->dividendDeclarations()
            ->with('financialYear')
            ->latest()
            ->paginate(20);

        return Inertia::render('Dividends/Index', [
            'somiti' => $somiti,
            'declarations' => $declarations,
            'financial_years' => $somiti->financialYears()->latest()->get(['id', 'title']),
            'can_declare' => Auth::user()->can('declare', $somiti),
        ]);
    }

    /**
     * Declare a dividend.
     */
    public function store(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('declare', $somiti)) {
            abort(403);
        }

        $request->validate([
            'total_amount' => 'required|numeric|min:0.01',
            'financial_year_id' => 'required|exists:financial_years,id',
            'profit_period' => 'nullable|string|max:50',
            'dividend_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            $declaration = DividendService::declareDividend(
                $somiti->id,
                (int) $request->input('financial_year_id'),
                (float) $request->input('total_amount'),
                (float) $request->input('dividend_rate', 100),
                $request->input('profit_period', 'FY '.now()->format('Y')),
                Auth::id(),
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['total_amount' => $e->getMessage()]);
        }

        return redirect()->route('web.dividends.show', $declaration)->with('success', 'Dividend declared and allocations created.');
    }

    /**
     * Show a declaration with its allocations.
     */
    public function show(DividendDeclaration $declaration)
    {
        if (! Auth::user()->can('view', $declaration)) {
            abort(403);
        }

        return Inertia::render('Dividends/Show', [
            'declaration' => $declaration->load('allocations.user', 'financialYear', 'somiti'),
            'can_decide' => Auth::user()->can('approve', $declaration),
        ]);
    }

    /**
     * Approve and pay the dividend declaration.
     */
    public function approve(DividendDeclaration $declaration)
    {
        if (! Auth::user()->can('approve', $declaration)) {
            abort(403);
        }

        if ($declaration->status === 'paid') {
            return back()->with('error', 'Already paid.');
        }

        try {
            DividendService::payDividends($declaration);
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Dividend paid and journal entries created.');
    }

    /**
     * Reject a pending declaration.
     */
    public function reject(DividendDeclaration $declaration)
    {
        if (! Auth::user()->can('approve', $declaration)) {
            abort(403);
        }

        if ($declaration->status !== 'pending') {
            return back()->with('error', 'Only pending declarations can be rejected.');
        }

        $declaration->update(['status' => 'rejected']);

        return back()->with('success', 'Dividend declaration rejected.');
    }
}
