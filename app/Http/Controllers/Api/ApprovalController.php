<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Services\ApprovalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $approvals = Approval::where('status', 'pending')
            ->whereHasMorph('approvable', ['App\\Models\\Deposit', 'App\\Models\\Loan', 'App\\Models\\Investment', 'App\\Models\\Fdr', 'App\\Models\\UserShare', 'App\\Models\\LoanRepayment', 'App\\Models\\Withdrawal', 'App\\Models\\Penalty', 'App\\Models\\ManagerElection'], function ($q) use ($user) {
                $q->where('status', 'pending')
                    ->where(function ($q2) use ($user) {
                        $q2->whereHas('somiti.members', fn ($m) => $m->where('user_id', $user->id))
                            ->orWhereHas('somiti.managers', fn ($m) => $m->where('user_id', $user->id));
                    });
            })->with('user', 'approvable')->paginate(30);

        return response()->json($approvals);
    }

    public function decide(Request $request, Approval $approval)
    {
        if (! Auth::user()->can('decide', $approval)) {
            abort(403);
        }

        $request->validate([
            'decision' => 'required|in:approved,rejected',
            'comment' => 'nullable|string',
            'signature' => 'nullable|string|max:255',
        ]);

        $approvable = $approval->approvable;

        if (! $approvable) {
            abort(404, 'Approvable not found.');
        }

        // Route the manager decision through the same workflow rules as voting,
        // so manager_can_approve_alone and quorum are respected.
        $result = ApprovalService::vote(
            Auth::user(),
            get_class($approvable),
            $approvable->id,
            $request->input('decision'),
            $request->input('comment'),
            $request->input('signature')
        );

        return response()->json([
            'vote' => $result,
            'approvable' => $approvable->fresh()->load('approvals.user'),
            'finalized' => isset($approvable->status) && $approvable->fresh()->status !== 'pending',
        ]);
    }

    /**
     * Cast a vote on an approvable (member voting / manager signing).
     */
    public function vote(Request $request)
    {
        $validated = $request->validate([
            'approvable_type' => 'required|string',
            'approvable_id' => 'required|integer',
            'decision' => 'required|in:approved,rejected',
            'comment' => 'nullable|string|max:1000',
            'signature' => 'nullable|string|max:255',
        ]);

        $approval = ApprovalService::vote(
            Auth::user(),
            $validated['approvable_type'],
            (int) $validated['approvable_id'],
            $validated['decision'],
            $validated['comment'] ?? null,
            $validated['signature'] ?? null
        );

        $approvable = $approval->approvable;

        return response()->json([
            'vote' => $approval,
            'approvable' => $approvable ? $approvable->load('approvals.user') : null,
            'finalized' => isset($approvable->status) && $approvable->status !== 'pending',
        ]);
    }
}
