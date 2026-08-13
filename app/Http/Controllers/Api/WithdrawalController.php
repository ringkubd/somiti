<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class WithdrawalController extends Controller
{
    /**
     * List withdrawals visible to the current user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $withdrawals = Withdrawal::with('user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->when($request->input('somiti_id'), fn ($q, $somitiId) => $q->where('somiti_id', $somitiId))
            ->latest()
            ->paginate(20);

        return response()->json($withdrawals);
    }

    /**
     * Create a withdrawal request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string',
            'method' => 'nullable|string|max:50',
        ]);

        $somiti = \App\Models\Somiti::findOrFail($request->input('somiti_id'));

        if (! (Auth::user()->isMemberOfSomiti($somiti->id) || Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        try {
            $withdrawal = WithdrawalService::create($somiti, Auth::id(), $request->only(['amount', 'reason', 'method']));
            $withdrawal->requestApproval($somiti->created_by_user_id, 'New withdrawal request.');
            \App\Models\Notification::sendToSomiti($somiti, 'New Withdrawal Request', Auth::user()->name.' requested a withdrawal of $'.number_format($withdrawal->amount, 2).'.');
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return response()->json($withdrawal->load('user'), 201);
    }

    public function show(Withdrawal $withdrawal)
    {
        if (! (Auth::user()->isMemberOfSomiti($withdrawal->somiti_id) || Auth::user()->isManagerOfSomiti($withdrawal->somiti_id) || Auth::user()->isOwnerOfSomiti($withdrawal->somiti_id))) {
            abort(403);
        }

        return response()->json($withdrawal->load('user', 'somiti'));
    }

    /**
     * Approve a withdrawal.
     */
    public function approve(Request $request, Withdrawal $withdrawal)
    {
        if (! (Auth::user()->isManagerOfSomiti($withdrawal->somiti_id) || Auth::user()->isOwnerOfSomiti($withdrawal->somiti_id))) {
            abort(403);
        }

        if ($withdrawal->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        try {
            $withdrawal = WithdrawalService::approve($withdrawal, Auth::id());
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages(['amount' => $e->getMessage()]);
        }

        return response()->json($withdrawal->load('user'));
    }

    /**
     * Reject a withdrawal.
     */
    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if (! (Auth::user()->isManagerOfSomiti($withdrawal->somiti_id) || Auth::user()->isOwnerOfSomiti($withdrawal->somiti_id))) {
            abort(403);
        }

        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Only pending withdrawals can be rejected'], 422);
        }

        $withdrawal->reject(Auth::id());

        return response()->json($withdrawal->load('user'));
    }
}
