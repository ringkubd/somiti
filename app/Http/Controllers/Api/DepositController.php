<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DepositController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // show deposits for somitis the user belongs to or manages
        $deposits = Deposit::whereHas('somiti.members', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->orWhereHas('somiti.managers', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('user', 'somiti')->paginate(20);

        return response()->json($deposits);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (! Auth::user()->isMemberOfSomiti($request->input('somiti_id'))) {
            abort(403);
        }

        $somiti = \App\Models\Somiti::findOrFail($request->input('somiti_id'));
        $financialYear = $somiti->financialYears()->where('is_active', true)->where('is_closed', false)->latest('id')->first();

        $deposit = Deposit::create(array_merge($request->only(['somiti_id', 'amount', 'method', 'notes']), [
            'user_id' => Auth::id(),
            'status' => 'pending',
            'financial_year_id' => $financialYear?->id,
        ]));
        $deposit->requestApproval($somiti->created_by_user_id, 'New deposit submission.');

        return response()->json($deposit, 201);
    }

    public function show(Deposit $deposit)
    {
        if (! Auth::user()->can('view', $deposit)) {
            abort(403);
        }

        return response()->json($deposit->load('user', 'somiti'));
    }

    public function update(Request $request, Deposit $deposit)
    {
        if (! Auth::user()->can('update', $deposit)) {
            abort(403);
        }

        $deposit->update($request->only(['amount', 'method', 'notes']));

        return response()->json($deposit);
    }

    public function destroy(Deposit $deposit)
    {
        if (! Auth::user()->can('delete', $deposit)) {
            abort(403);
        }

        $deposit->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, Deposit $deposit)
    {
        if (! Auth::user()->can('approve', $deposit)) {
            abort(403);
        }

        if ($deposit->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $deposit->approve(Auth::id());

        return response()->json($deposit);
    }
}
