<?php

namespace App\Traits;

use App\Models\Approval;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasApprovals
{
    public function approvals(): MorphMany
    {
        return $this->morphMany(Approval::class, 'approvable');
    }

    /**
     * Request approval by creating a pending approval record.
     */
    public function requestApproval(int $userId, ?string $comment = null): Approval
    {
        return $this->approvals()->create([
            'user_id' => $userId,
            'status' => 'pending',
            'comment' => $comment,
        ]);
    }

    public function isApproved(): bool
    {
        return $this->approvals()->where('status', 'approved')->exists();
    }
}