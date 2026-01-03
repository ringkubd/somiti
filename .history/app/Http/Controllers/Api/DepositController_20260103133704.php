<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Approval;
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

        $deposit = Deposit::create(array_merge($request->only(['somiti_id', 'amount', 'method', 'notes']), ['user_id' => Auth::id(), 'status' => 'pending']));

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
        $this->authorize('delete', $deposit);

        $deposit->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, Deposit $deposit)
    {
        $this->authorize('approve', $deposit);

        if ($deposit->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $deposit->status = 'approved';
        $deposit->approved_by = Auth::id();
        $deposit->approved_at = now();
        $deposit->save();

        // create an approval record
        Approval::create([
            'approvable_id' => $deposit->id,
            'approvable_type' => Deposit::class,
            'user_id' => Auth::id(),
            'decision' => 'approved',
            'comments' => $request->input('comments'),
        ]);

        return response()->json($deposit);
    }
}
