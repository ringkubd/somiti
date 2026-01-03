<?php

namespace App\Policies;

use App\Models\Investment;
use App\Models\User;

class InvestmentPolicy
{
    public function view(User $user, Investment $investment): bool
    {
        return $user->isMemberOfSomiti($investment->somiti_id) || $user->isManagerOfSomiti($investment->somiti_id) || $user->isOwnerOfSomiti($investment->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        // Only managers or members can propose investments; restrict to managers/owners
        return $user->isManagerOfSomiti($somitiId) || $user->isOwnerOfSomiti($somitiId);
    }

    public function approve(User $user, Investment $investment): bool
    {
        return $user->isManagerOfSomiti($investment->somiti_id) || $user->isOwnerOfSomiti($investment->somiti_id);
    }

    public function update(User $user, Investment $investment): bool
    {
        return $user->isOwnerOfSomiti($investment->somiti_id) || $user->id === $investment->user_id;
    }

    public function delete(User $user, Investment $investment): bool
    {
        return $this->update($user, $investment);
    }
}
