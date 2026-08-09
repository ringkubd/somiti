<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Services\LoanRepaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoanRepaymentController extends Controller
{
    /**
     * List repayments visible to the current user.
     */
    public function index()
    {
        $user = Auth::user();

        $repayments = LoanRepayment::with('loan', 'user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Repayments/Index', [
            'repayments' => $repayments,
        ]);
    }

    /**
     * Show a single repayment.
     */
    public function show(LoanRepayment $repayment)
    {
        $user = Auth::user();

        if (! (
            $repayment->user_id === $user->id ||
            $user->isManagerOfSomiti($repayment->somiti_id) ||
            $user->isOwnerOfSomiti($repayment->somiti_id)
        )) {
            abort(403);
        }

        return Inertia::render('Repayments/Show', [
            'repayment' => $repayment->load('loan', 'user', 'somiti', 'approver'),
            'can_decide' => $user->isManagerOfSomiti($repayment->somiti_id) || $user->isOwnerOfSomiti($repayment->somiti_id),
        ]);
    }

    /**
     * List repayments for a single loan.
     */
    public function forLoan(Loan $loan)
    {
        $user = Auth::user();

        if (! $user->can('view', $loan)) {
            abort(403);
        }

        $repayments = $loan->repayments()->with('user')->latest()->paginate(20);

        return Inertia::render('Repayments/Loan', [
            'loan' => $loan->load('somiti', 'user'),
            'repayments' => $repayments,
            'can_decide' => $user->isManagerOfSomiti($loan->somiti_id) || $user->isOwnerOfSomiti($loan->somiti_id),
            'can_create' => $user->can('create', [LoanRepayment::class, $loan]),
        ]);
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
            LoanRepaymentService::create($loan, Auth::id(), $request->only(['amount', 'payment_date', 'method', 'notes']));
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return redirect()->route('web.loans.repayments.index', $loan)->with('success', 'Repayment request submitted for approval.');
    }

    /**
     * Approve a repayment request.
     */
    public function approve(LoanRepayment $repayment)
    {
        if (! (Auth::user()->isManagerOfSomiti($repayment->somiti_id) || Auth::user()->isOwnerOfSomiti($repayment->somiti_id))) {
            abort(403);
        }

        if ($repayment->status === 'approved') {
            return back()->with('error', 'Already approved.');
        }

        $repayment->approve(Auth::id());

        return back()->with('success', 'Repayment approved.');
    }

    /**
     * Reject a repayment request.
     */
    public function reject(LoanRepayment $repayment)
    {
        if (! (Auth::user()->isManagerOfSomiti($repayment->somiti_id) || Auth::user()->isOwnerOfSomiti($repayment->somiti_id))) {
            abort(403);
        }

        if ($repayment->status !== 'pending') {
            return back()->with('error', 'Only pending repayments can be rejected.');
        }

        $repayment->reject(Auth::id());

        return back()->with('success', 'Repayment rejected.');
    }
}
