<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Withdrawal;

class WithdrawalPolicy
{
    public function view(User $user, Withdrawal $withdrawal): bool
    {
        return $user->id === $withdrawal->user_id
            || $user->isMemberOfSomiti($withdrawal->somiti_id)
            || $user->isManagerOfSomiti($withdrawal->somiti_id)
            || $user->isOwnerOfSomiti($withdrawal->somiti_id);
    }

    public function approve(User $user, Withdrawal $withdrawal): bool
    {
        return $user->isManagerOfSomiti($withdrawal->somiti_id)
            || $user->isOwnerOfSomiti($withdrawal->somiti_id);
    }
}
