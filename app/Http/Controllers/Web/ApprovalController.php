<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

class ApprovalController extends Controller
{
    public function index()
    {
        $approvals = \App\Models\Approval::with(['approvable', 'user'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Approvals/Index', [
            'approvals' => $approvals,
        ]);
    }

    public function show(\App\Models\Approval $approval)
    {
        // check access
        if ($approval->user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('Approvals/Show', [
            'approval' => $approval->load(['approvable', 'user']),
        ]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Approval $approval)
    {
        if ($approval->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'comment' => 'nullable|string',
        ]);

        $model = $approval->approvable;
        if (! $model) {
            return redirect()->route('approvals.index')->with('error', 'No associated record found.');
        }

        if ($request->status === 'approved' && method_exists($model, 'approve')) {
            $model->approve(auth()->id());
        } elseif ($request->status === 'rejected' && method_exists($model, 'reject')) {
            $model->reject(auth()->id(), $request->comment);
        }

        return redirect()->route('approvals.index')->with('success', 'Request '.$request->status.' successfully.');
    }
}
