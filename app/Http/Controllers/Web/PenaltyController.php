<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Penalty;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PenaltyController extends Controller
{
    /**
     * List penalties visible to the current user.
     */
    public function index()
    {
        $user = Auth::user();

        $penalties = Penalty::with('user', 'somiti')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id))
                    ->orWhereHas('somiti', fn ($s) => $s->where('created_by_user_id', $user->id));
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('Penalties/Index', [
            'penalties' => $penalties,
        ]);
    }

    /**
     * Show the create form (managers/owners only).
     */
    public function create(Request $request)
    {
        $user = Auth::user();

        $somitis = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('managers', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name']);

        $somitiId = $request->query('somiti_id') ? (int) $request->query('somiti_id') : ($somitis->first()?->id ?? null);

        $members = $somitiId
            ? Somiti::find($somitiId)?->members()->where('is_active', true)->with('user:id,name,email,phone')->get()
            : collect();

        return Inertia::render('Penalties/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $somitiId,
            'members' => $members,
        ]);
    }

    /**
     * Store a penalty.
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'user_id' => 'required|exists:users,id',
            'type' => 'nullable|in:late_deposit,loan_default,other',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $somiti = Somiti::findOrFail($request->input('somiti_id'));

        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        $penalty = Penalty::create(array_merge(
            $request->only(['somiti_id', 'user_id', 'type', 'amount', 'notes']),
            ['status' => 'pending']
        ));

        return redirect()->route('web.penalties.show', $penalty)->with('success', 'Penalty created and queued for approval.');
    }

    /**
     * Show a penalty.
     */
    public function show(Penalty $penalty)
    {
        if (! Auth::user()->can('view', $penalty)) {
            abort(403);
        }

        return Inertia::render('Penalties/Show', [
            'penalty' => $penalty->load('user', 'somiti', 'approver'),
            'can_decide' => Auth::user()->isManagerOfSomiti($penalty->somiti_id) || Auth::user()->isOwnerOfSomiti($penalty->somiti_id),
        ]);
    }

    /**
     * Approve a penalty.
     */
    public function approve(Penalty $penalty)
    {
        if (! (Auth::user()->isManagerOfSomiti($penalty->somiti_id) || Auth::user()->isOwnerOfSomiti($penalty->somiti_id))) {
            abort(403);
        }

        if ($penalty->status === 'approved') {
            return back()->with('error', 'Already approved.');
        }

        $penalty->approve(Auth::id());

        return back()->with('success', 'Penalty approved.');
    }

    /**
     * Reject a penalty.
     */
    public function reject(Penalty $penalty)
    {
        if (! (Auth::user()->isManagerOfSomiti($penalty->somiti_id) || Auth::user()->isOwnerOfSomiti($penalty->somiti_id))) {
            abort(403);
        }

        if ($penalty->status !== 'pending') {
            return back()->with('error', 'Only pending penalties can be rejected.');
        }

        $penalty->reject(Auth::id());

        return back()->with('success', 'Penalty rejected.');
    }
}
