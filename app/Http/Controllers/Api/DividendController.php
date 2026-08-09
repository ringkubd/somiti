<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DividendDeclaration;
use App\Models\Somiti;
use App\Services\DividendService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

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

        return response()->json($declarations);
    }

    /**
     * Declare a dividend (creates per-member allocations).
     */
    public function store(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('declare', $somiti)) {
            abort(403);
        }

        $request->validate([
            'total_amount' => 'required|numeric|min:0.01',
            'distribution_type' => 'nullable|in:share_based,equal,custom',
            'financial_year_id' => 'required|exists:financial_years,id',
            'profit_period' => 'nullable|string|max:50',
            'dividend_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        $distributionType = $request->input('distribution_type', 'share_based');

        if ($distributionType !== 'share_based') {
            throw ValidationException::withMessages([
                'distribution_type' => 'Only share-based distribution is supported at this time.',
            ]);
        }

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
            throw ValidationException::withMessages(['total_amount' => $e->getMessage()]);
        }

        return response()->json($declaration->load('allocations'), 201);
    }

    /**
     * Show a declaration with its allocations.
     */
    public function show(DividendDeclaration $declaration)
    {
        if (! Auth::user()->can('view', $declaration)) {
            abort(403);
        }

        return response()->json($declaration->load('allocations.user', 'financialYear'));
    }

    /**
     * Approve and pay a dividend declaration.
     */
    public function approve(DividendDeclaration $declaration)
    {
        if (! Auth::user()->can('approve', $declaration)) {
            abort(403);
        }

        if ($declaration->status === 'paid') {
            return response()->json(['message' => 'Already paid'], 422);
        }

        try {
            DividendService::payDividends($declaration);
        } catch (\RuntimeException $e) {
            throw ValidationException::withMessages(['declaration' => $e->getMessage()]);
        }

        return response()->json($declaration->fresh()->load('allocations'));
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
            return response()->json(['message' => 'Only pending declarations can be rejected'], 422);
        }

        $declaration->update(['status' => 'rejected']);

        return response()->json($declaration);
    }
}
