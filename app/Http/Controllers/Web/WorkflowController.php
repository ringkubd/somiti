<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\SomitiWorkflow;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function edit(Somiti $somiti)
    {
        $this->authorize('update', $somiti);

        $types = ['deposit', 'loan', 'investment', 'fdr', 'share', 'share_transfer'];
        $workflows = [];

        foreach ($types as $type) {
            $workflows[$type] = SomitiWorkflow::getForType($somiti->id, $type);
        }

        return Inertia::render('Somiti/Workflows', [
            'somiti' => $somiti,
            'workflows' => $workflows,
        ]);
    }

    public function update(Request $request, Somiti $somiti)
    {
        $this->authorize('update', $somiti);

        $validated = $request->validate([
            'workflows' => 'required|array',
            'workflows.*.transaction_type' => 'required|string',
            'workflows.*.requires_approval' => 'boolean',
            'workflows.*.manager_can_approve_alone' => 'boolean',
            'workflows.*.min_approvals_required' => 'required|integer|min:1',
        ]);

        foreach ($validated['workflows'] as $wf) {
            SomitiWorkflow::updateOrCreate(
                ['somiti_id' => $somiti->id, 'transaction_type' => $wf['transaction_type']],
                [
                    'requires_approval' => $wf['requires_approval'] ?? true,
                    'manager_can_approve_alone' => $wf['manager_can_approve_alone'] ?? true,
                    'min_approvals_required' => $wf['min_approvals_required'] ?? 1,
                ]
            );
        }

        return redirect()->back()->with('success', 'Workflow settings updated.');
    }
}
