<?php

namespace App\Policies;

use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\User;

class LoanRepaymentPolicy
{
    public function view(User $user, LoanRepayment $repayment): bool
    {
        return $user->id === $repayment->user_id
            || $user->isMemberOfSomiti($repayment->somiti_id)
            || $user->isManagerOfSomiti($repayment->somiti_id)
            || $user->isOwnerOfSomiti($repayment->somiti_id);
    }

    public function create(User $user, Loan $loan): bool
    {
        // A member can only repay their own loan; managers/owners can record repayments too
        return $user->id === $loan->user_id
            || $user->isManagerOfSomiti($loan->somiti_id)
            || $user->isOwnerOfSomiti($loan->somiti_id);
    }

    public function approve(User $user, LoanRepayment $repayment): bool
    {
        return $user->isManagerOfSomiti($repayment->somiti_id)
            || $user->isOwnerOfSomiti($repayment->somiti_id);
    }
}
