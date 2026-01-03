<?php

namespace App\Policies;

use App\Models\Fdr;
use App\Models\User;

class FdrPolicy
{
    public function view(User $user, Fdr $fdr): bool
    {
        return $user->isMemberOfSomiti($fdr->somiti_id) || $user->isManagerOfSomiti($fdr->somiti_id) || $user->isOwnerOfSomiti($fdr->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        return $user->isManagerOfSomiti($somitiId) || $user->isOwnerOfSomiti($somitiId);
    }

    public function approve(User $user, Fdr $fdr): bool
    {
        return $user->isManagerOfSomiti($fdr->somiti_id) || $user->isOwnerOfSomiti($fdr->somiti_id);
    }

    public function update(User $user, Fdr $fdr): bool
    {
        return $user->isOwnerOfSomiti($fdr->somiti_id);
    }

    public function delete(User $user, Fdr $fdr): bool
    {
        return $this->update($user, $fdr);
    }
}
