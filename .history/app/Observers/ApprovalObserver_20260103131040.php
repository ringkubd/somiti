<?php

namespace App\Observers;

use App\Models\Approval;

class ApprovalObserver
{
    public function created(Approval $approval): void
    {
        $this->applyApproval($approval);
    }

    public function updated(Approval $approval): void
    {
        $this->applyApproval($approval);
    }

    protected function applyApproval(Approval $approval): void
    {
        $approvable = $approval->approvable()->lockForUpdate()->first();

        if (! $approvable) {
            return;
        }

        // If decision is approved, mark the approvable as approved
        if ($approval->status === 'approved') {
            $attributes = ['status' => 'approved'];

            if (property_exists($approvable, 'approved_by')) {
                $attributes['approved_by'] = $approval->user_id;
            }

            if (property_exists($approvable, 'approved_at')) {
                $attributes['approved_at'] = $approval->decided_at ?? now();
            }

            $approvable->fill($attributes);
            $approvable->save();
        }

        // If rejected, mark the approvable rejected
        if ($approval->status === 'rejected') {
            $attributes = ['status' => 'rejected'];

            if (property_exists($approvable, 'approved_by')) {
                $attributes['approved_by'] = $approval->user_id;
            }

            if (property_exists($approvable, 'approved_at')) {
                $attributes['approved_at'] = $approval->decided_at ?? now();
            }

            $approvable->fill($attributes);
            $approvable->save();
        }
    }
}
