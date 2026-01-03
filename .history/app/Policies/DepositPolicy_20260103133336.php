<?php

namespace App\Policies;

use App\Models\Deposit;
use App\Models\User;

class DepositPolicy
{
    public function view(User $user, Deposit $deposit): bool
    {
        // member of somiti or owner/manager
        return $user->isMemberOfSomiti($deposit->somiti_id) || $user->isManagerOfSomiti($deposit->somiti_id) || $user->isOwnerOfSomiti($deposit->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        // Any member can create deposit
        return $user->isMemberOfSomiti($somitiId);
    }

    public function approve(User $user, Deposit $deposit): bool
    {
        // Only manager or owner of somiti
        return $user->isManagerOfSomiti($deposit->somiti_id) || $user->isOwnerOfSomiti($deposit->somiti_id);
    }

    public function update(User $user, Deposit $deposit): bool
    {
        // user who owns deposit or manager/owner
        return $user->id === $deposit->user_id || $this->approve($user, $deposit);
    }

    public function delete(User $user, Deposit $deposit): bool
    {
        return $this->update($user, $deposit);
    }
}
