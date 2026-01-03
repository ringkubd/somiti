<?php

namespace App\Policies;

use App\Models\Loan;
use App\Models\User;

class LoanPolicy
{
    public function view(User $user, Loan $loan): bool
    {
        return $user->isMemberOfSomiti($loan->somiti_id) || $user->isManagerOfSomiti($loan->somiti_id) || $user->isOwnerOfSomiti($loan->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        // Members can request loans
        return $user->isMemberOfSomiti($somitiId);
    }

    public function approve(User $user, Loan $loan): bool
    {
        // Only manager or owner
        return $user->isManagerOfSomiti($loan->somiti_id) || $user->isOwnerOfSomiti($loan->somiti_id);
    }

    public function disburse(User $user, Loan $loan): bool
    {
        // Only manager or owner
        return $this->approve($user, $loan);
    }

    public function update(User $user, Loan $loan): bool
    {
        return $user->id === $loan->user_id || $this->approve($user, $loan);
    }

    public function delete(User $user, Loan $loan): bool
    {
        return $this->update($user, $loan);
    }
}
