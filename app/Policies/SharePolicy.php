<?php

namespace App\Policies;

use App\Models\Share;
use App\Models\User;

class SharePolicy
{
    public function view(User $user, Share $share): bool
    {
        return $user->isMemberOfSomiti($share->somiti_id) || $user->isManagerOfSomiti($share->somiti_id) || $user->isOwnerOfSomiti($share->somiti_id);
    }

    public function update(User $user, Share $share): bool
    {
        return $user->isManagerOfSomiti($share->somiti_id) || $user->isOwnerOfSomiti($share->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        return $user->isManagerOfSomiti($somitiId) || $user->isOwnerOfSomiti($somitiId);
    }
}
