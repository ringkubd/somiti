<?php

namespace App\Observers;

use App\Models\Approval;

class ApprovalObserver
{
    /**
     * ApprovalObserver does NOT cascade status changes to the approvable model.
     *
     * The authoritative approval path is:
     *   Controller → Model::approve() → Model saves status → Model observer fires
     *
     * Approval records are audit artifacts, not state drivers.
     */
    public function created(Approval $approval): void
    {
        // No cascading — model::approve() is the authoritative path
    }

    public function updated(Approval $approval): void
    {
        // No cascading — model::approve() is the authoritative path
    }
}
