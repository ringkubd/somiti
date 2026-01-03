<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Approval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoanController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $loans = Loan::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhereHas('somiti.members', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                })
                ->orWhereHas('somiti.managers', function ($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                });
        })->with('user', 'somiti')->paginate(20);

        return response()->json($loans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:1',
            'term_months' => 'nullable|integer|min:1',
            'purpose' => 'nullable|string',
        ]);

        if (! Auth::user()->can('create', [Loan::class, $request->input('somiti_id')])) {
            abort(403);
        }

        $loan = Loan::create(array_merge($request->only(['somiti_id', 'amount', 'term_months', 'purpose']), ['user_id' => Auth::id(), 'status' => 'pending']));

        return response()->json($loan, 201);
    }

    public function show(Loan $loan)
    {
        if (! Auth::user()->can('view', $loan)) {
            abort(403);
        }

        return response()->json($loan->load('user', 'somiti'));
    }

    public function update(Request $request, Loan $loan)
    {
        if (! Auth::user()->can('update', $loan)) {
            abort(403);
        }

        $loan->update($request->only(['amount', 'term_months', 'purpose']));

        return response()->json($loan);
    }

    public function destroy(Loan $loan)
    {
        if (! Auth::user()->can('delete', $loan)) {
            abort(403);
        }

        $loan->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, Loan $loan)
    {
        if (! Auth::user()->can('approve', $loan)) {
            abort(403);
        }

        if ($loan->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $loan->status = 'approved';
        $loan->approved_by = Auth::id();
        $loan->approved_at = now();
        $loan->save();

        Approval::create([
            'approvable_id' => $loan->id,
            'approvable_type' => Loan::class,
            'user_id' => Auth::id(),
            'status' => 'approved',
            'comment' => $request->input('comments'),
        ]);

        return response()->json($loan);
    }

    public function disburse(Request $request, Loan $loan)
    {
        if (! Auth::user()->can('disburse', $loan)) {
            abort(403);
        }

        if ($loan->status !== 'approved') {
            return response()->json(['message' => 'Loan must be approved before disbursing'], 422);
        }

        if ($loan->disbursed_at) {
            return response()->json(['message' => 'Already disbursed'], 422);
        }

        $loan->disbursed_at = now();
        $loan->status = 'disbursed';
        $loan->save();

        // Observer will create ledger entry for disbursement

        return response()->json($loan);
    }
}
