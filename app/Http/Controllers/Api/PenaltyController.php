<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penalty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PenaltyController extends Controller
{
    /**
     * List penalties visible to the current user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $penalties = Penalty::with('user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->when($request->input('somiti_id'), fn ($q, $somitiId) => $q->where('somiti_id', $somitiId))
            ->latest()
            ->paginate(20);

        return response()->json($penalties);
    }

    /**
     * Create a penalty (managers/owners only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'user_id' => 'required|exists:users,id',
            'type' => 'nullable|in:late_deposit,loan_default,other',
            'amount' => 'required|numeric|min:0.01',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        $somiti = \App\Models\Somiti::findOrFail($request->input('somiti_id'));

        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        $penalty = Penalty::create(array_merge(
            $request->only(['somiti_id', 'user_id', 'type', 'amount', 'reference_type', 'reference_id', 'notes']),
            ['status' => 'pending']
        ));

        return response()->json($penalty->load('user'), 201);
    }

    public function show(Penalty $penalty)
    {
        if (! Auth::user()->can('view', $penalty)) {
            abort(403);
        }

        return response()->json($penalty->load('user', 'somiti'));
    }

    /**
     * Approve a penalty.
     */
    public function approve(Request $request, Penalty $penalty)
    {
        if (! (Auth::user()->isManagerOfSomiti($penalty->somiti_id) || Auth::user()->isOwnerOfSomiti($penalty->somiti_id))) {
            abort(403);
        }

        if ($penalty->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $penalty->approve(Auth::id());

        return response()->json($penalty->load('user'));
    }

    /**
     * Reject a penalty.
     */
    public function reject(Request $request, Penalty $penalty)
    {
        if (! (Auth::user()->isManagerOfSomiti($penalty->somiti_id) || Auth::user()->isOwnerOfSomiti($penalty->somiti_id))) {
            abort(403);
        }

        if ($penalty->status !== 'pending') {
            return response()->json(['message' => 'Only pending penalties can be rejected'], 422);
        }

        $penalty->reject(Auth::id());

        return response()->json($penalty->load('user'));
    }
}
