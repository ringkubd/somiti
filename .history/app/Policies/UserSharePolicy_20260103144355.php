<?php

namespace App\Policies;

use App\Models\UserShare;
use App\Models\User;

class UserSharePolicy
{
    public function view(User $user, UserShare $share): bool
    {
        return $user->id === $share->user_id || $user->isManagerOfSomiti($share->somiti_id) || $user->isOwnerOfSomiti($share->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        // Members can buy shares
        return $user->isMemberOfSomiti($somitiId);
    }

    public function approve(User $user, UserShare $share): bool
    {
        return $user->isManagerOfSomiti($share->somiti_id) || $user->isOwnerOfSomiti($share->somiti_id);
    }

    public function delete(User $user, UserShare $share): bool
    {
        return $user->id === $share->user_id || $user->isOwnerOfSomiti($share->somiti_id);
    }
}
