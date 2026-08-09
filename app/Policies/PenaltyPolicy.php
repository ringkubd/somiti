<?php

namespace App\Policies;

use App\Models\Penalty;
use App\Models\User;

class PenaltyPolicy
{
    public function view(User $user, Penalty $penalty): bool
    {
        return $user->id === $penalty->user_id
            || $user->isMemberOfSomiti($penalty->somiti_id)
            || $user->isManagerOfSomiti($penalty->somiti_id)
            || $user->isOwnerOfSomiti($penalty->somiti_id);
    }

    public function approve(User $user, Penalty $penalty): bool
    {
        return $user->isManagerOfSomiti($penalty->somiti_id)
            || $user->isOwnerOfSomiti($penalty->somiti_id);
    }
}
