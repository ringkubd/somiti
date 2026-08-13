<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Services\LoanRepaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoanRepaymentController extends Controller
{
    /**
     * List repayments visible to the current user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $repayments = LoanRepayment::with('loan', 'user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->when($request->input('loan_id'), fn ($q, $loanId) => $q->where('loan_id', $loanId))
            ->latest()
            ->paginate(20);

        return response()->json($repayments);
    }

    /**
     * List repayments for a single loan.
     */
    public function forLoan(Request $request, Loan $loan)
    {
        if (! Auth::user()->can('view', $loan)) {
            abort(403);
        }

        $repayments = $loan->repayments()
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json($repayments);
    }

    /**
     * Create a repayment request.
     */
    public function store(Request $request, Loan $loan)
    {
        if (! Auth::user()->can('create', [LoanRepayment::class, $loan])) {
            abort(403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'nullable|date',
            'method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        try {
            $repayment = LoanRepaymentService::create($loan, Auth::id(), $request->only(['amount', 'payment_date', 'method', 'notes']));
            $repayment->requestApproval($loan->somiti->created_by_user_id, 'New loan repayment.');
            \App\Models\Notification::sendToSomiti($loan->somiti, 'New Loan Repayment', Auth::user()->name.' submitted a loan repayment of $'.number_format($repayment->amount, 2).'.');
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return response()->json($repayment->load('loan', 'user'), 201);
    }

    /**
     * Approve a repayment request.
     */
    public function approve(Request $request, LoanRepayment $repayment)
    {
        if (! Auth::user()->can('approve', $repayment)) {
            abort(403);
        }

        if ($repayment->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $repayment->approve(Auth::id());

        return response()->json($repayment->load('loan', 'user'));
    }

    /**
     * Reject a repayment request.
     */
    public function reject(Request $request, LoanRepayment $repayment)
    {
        if (! Auth::user()->can('approve', $repayment)) {
            abort(403);
        }

        if ($repayment->status !== 'pending') {
            return response()->json(['message' => 'Only pending repayments can be rejected'], 422);
        }

        $repayment->reject(Auth::id());

        return response()->json($repayment->load('loan', 'user'));
    }
}
