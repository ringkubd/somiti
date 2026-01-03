<?php

namespace App\Policies;

use App\Models\Approval;
use App\Models\User;

class ApprovalPolicy
{
    public function viewAny(User $user)
    {
        // managers/owners can view pending approvals across their somitis
        return true; // filtered in controller by somiti membership
    }

    public function decide(User $user, Approval $approval): bool
    {
        $approvable = $approval->approvable;

        // allow if manager or owner of the approvable's somiti
        if (isset($approvable->somiti_id)) {
            return $user->isManagerOfSomiti($approvable->somiti_id) || $user->isOwnerOfSomiti($approvable->somiti_id);
        }

        return false;
    }
}
