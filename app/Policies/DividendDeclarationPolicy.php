<?php

namespace App\Policies;

use App\Models\DividendDeclaration;
use App\Models\User;

class DividendDeclarationPolicy
{
    public function view(User $user, DividendDeclaration $declaration): bool
    {
        return $user->isMemberOfSomiti($declaration->somiti_id)
            || $user->isManagerOfSomiti($declaration->somiti_id)
            || $user->isOwnerOfSomiti($declaration->somiti_id);
    }

    public function approve(User $user, DividendDeclaration $declaration): bool
    {
        return $user->isManagerOfSomiti($declaration->somiti_id)
            || $user->isOwnerOfSomiti($declaration->somiti_id);
    }
}
