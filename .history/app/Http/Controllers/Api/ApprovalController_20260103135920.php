<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApprovalController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $approvals = Approval::where('status', 'pending')
            ->whereHasMorph('approvable', ['App\\Models\\Deposit','App\\Models\\Loan','App\\Models\\Investment','App\\Models\\Fdr','App\\Models\\UserShare'], function ($q) use ($user) {
                $q->whereHas('somiti.members', function ($q2) use ($user) { $q2->where('user_id', $user->id); })
                  ->orWhereHas('somiti.managers', function ($q2) use ($user) { $q2->where('user_id', $user->id); });
            })->with('user','approvable')->paginate(30);

        return response()->json($approvals);
    }

    public function decide(Request $request, Approval $approval)
    {
        if (! Auth::user()->can('decide', $approval)) abort(403);

        $request->validate(['decision' => 'required|in:approved,rejected','comment' => 'nullable|string']);

        if ($request->input('decision') === 'approved') {
            $approval->approve();
            $approval->comment = $request->input('comment');
            $approval->save();

            // apply approval to approvable if method exists
            if (method_exists($approval->approvable, 'approve')) {
                $approval->approvable->approve(Auth::id());
            }
        } else {
            $approval->reject($request->input('comment'));
            if (method_exists($approval->approvable, 'reject')) {
                $approval->approvable->reject(Auth::id(), $request->input('comment'));
            }
        }

        return response()->json($approval);
    }
}
