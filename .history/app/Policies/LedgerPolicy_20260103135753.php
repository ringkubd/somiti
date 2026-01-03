<?php

namespace App\Policies;

use App\Models\Ledger;
use App\Models\User;

class LedgerPolicy
{
    public function view(User $user, Ledger $ledger): bool
    {
        return $user->isMemberOfSomiti($ledger->somiti_id) || $user->isManagerOfSomiti($ledger->somiti_id) || $user->isOwnerOfSomiti($ledger->somiti_id);
    }

    public function index(User $user, $somitiId): bool
    {
        return $user->isMemberOfSomiti($somitiId) || $user->isManagerOfSomiti($somitiId) || $user->isOwnerOfSomiti($somitiId);
    }
}
