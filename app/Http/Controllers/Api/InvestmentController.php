<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvestmentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $investments = Investment::where(function ($q) use ($user) {
            $q->whereHas('somiti.members', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhereHas('somiti.managers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                });
        })->with('somiti', 'financialYear')->paginate(20);

        return response()->json($investments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'financial_year_id' => 'required|exists:financial_years,id',
            'type' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'start_date' => 'nullable|date',
            'maturity_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if (! Auth::user()->can('create', [Investment::class, $request->input('somiti_id')])) {
            abort(403);
        }

        $somiti = \App\Models\Somiti::findOrFail($request->input('somiti_id'));
        $investment = Investment::create(array_merge($request->only(['somiti_id', 'financial_year_id', 'type', 'amount', 'start_date', 'maturity_date']), ['user_id' => Auth::id(), 'status' => 'pending']));
        $investment->requestApproval($somiti->created_by_user_id, 'New investment application.');
        \App\Models\Notification::sendToSomiti($somiti, 'New Investment', Auth::user()->name.' added an investment of $'.number_format($investment->amount, 2).'.');

        return response()->json($investment, 201);
    }

    public function show(Investment $investment)
    {
        if (! Auth::user()->can('view', $investment)) {
            abort(403);
        }

        return response()->json($investment->load('somiti', 'financialYear'));
    }

    public function update(Request $request, Investment $investment)
    {
        if (! Auth::user()->can('update', $investment)) {
            abort(403);
        }

        $investment->update($request->only(['amount', 'maturity_date', 'start_date', 'expected_return']));

        return response()->json($investment);
    }

    public function destroy(Investment $investment)
    {
        if (! Auth::user()->can('delete', $investment)) {
            abort(403);
        }

        $investment->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, Investment $investment)
    {
        if (! Auth::user()->can('approve', $investment)) {
            abort(403);
        }

        if ($investment->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $investment->approve(Auth::id());

        return response()->json($investment);
    }
}
