<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    /**
     * List withdrawals visible to the current user.
     */
    public function index()
    {
        $user = Auth::user();

        $withdrawals = Withdrawal::with('user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Withdrawals/Index', [
            'withdrawals' => $withdrawals,
        ]);
    }

    /**
     * Show the create form.
     */
    public function create(Request $request)
    {
        $user = Auth::user();

        $somitis = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id)->where('is_active', true))
            ->get(['id', 'name']);

        return Inertia::render('Withdrawals/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $request->query('somiti_id') ? (int) $request->query('somiti_id') : null,
        ]);
    }

    /**
     * Store a withdrawal request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string',
            'method' => 'nullable|string|max:50',
        ]);

        $somiti = Somiti::findOrFail($request->input('somiti_id'));

        if (! (Auth::user()->isMemberOfSomiti($somiti->id) || Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        try {
            $withdrawal = WithdrawalService::create($somiti, Auth::id(), $request->only(['amount', 'reason', 'method']));
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return redirect()->route('web.withdrawals.show', $withdrawal)->with('success', 'Withdrawal request submitted for approval.');
    }

    /**
     * Show a withdrawal.
     */
    public function show(Withdrawal $withdrawal)
    {
        $user = Auth::user();

        if (! (
            $withdrawal->user_id === $user->id ||
            $user->isMemberOfSomiti($withdrawal->somiti_id) ||
            $user->isManagerOfSomiti($withdrawal->somiti_id) ||
            $user->isOwnerOfSomiti($withdrawal->somiti_id)
        )) {
            abort(403);
        }

        return Inertia::render('Withdrawals/Show', [
            'withdrawal' => $withdrawal->load('user', 'somiti', 'approver'),
            'can_decide' => $user->isManagerOfSomiti($withdrawal->somiti_id) || $user->isOwnerOfSomiti($withdrawal->somiti_id),
        ]);
    }

    /**
     * Approve a withdrawal.
     */
    public function approve(Withdrawal $withdrawal)
    {
        if (! (Auth::user()->isManagerOfSomiti($withdrawal->somiti_id) || Auth::user()->isOwnerOfSomiti($withdrawal->somiti_id))) {
            abort(403);
        }

        if ($withdrawal->status === 'approved') {
            return back()->with('error', 'Already approved.');
        }

        try {
            WithdrawalService::approve($withdrawal, Auth::id());
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Withdrawal approved.');
    }

    /**
     * Reject a withdrawal.
     */
    public function reject(Withdrawal $withdrawal)
    {
        if (! (Auth::user()->isManagerOfSomiti($withdrawal->somiti_id) || Auth::user()->isOwnerOfSomiti($withdrawal->somiti_id))) {
            abort(403);
        }

        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending withdrawals can be rejected.');
        }

        $withdrawal->reject(Auth::id());

        return back()->with('success', 'Withdrawal rejected.');
    }
}
