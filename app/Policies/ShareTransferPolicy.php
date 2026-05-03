<?php

namespace App\Policies;

use App\Models\ShareTransfer;
use App\Models\User;

class ShareTransferPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ShareTransfer $shareTransfer): bool
    {
        return $user->isMemberOfSomiti($shareTransfer->somiti_id)
            || $user->isManagerOfSomiti($shareTransfer->somiti_id)
            || $user->isOwnerOfSomiti($shareTransfer->somiti_id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ShareTransfer $shareTransfer): bool
    {
        return $shareTransfer->status === 'pending'
            && ($user->isManagerOfSomiti($shareTransfer->somiti_id)
                || $user->isOwnerOfSomiti($shareTransfer->somiti_id));
    }

    public function approve(User $user, ShareTransfer $shareTransfer): bool
    {
        return $user->isManagerOfSomiti($shareTransfer->somiti_id)
            || $user->isOwnerOfSomiti($shareTransfer->somiti_id);
    }

    public function delete(User $user, ShareTransfer $shareTransfer): bool
    {
        return $shareTransfer->status === 'pending'
            && ($user->id === $shareTransfer->from_user_id
                || $user->isManagerOfSomiti($shareTransfer->somiti_id)
                || $user->isOwnerOfSomiti($shareTransfer->somiti_id));
    }

    public function restore(User $user, ShareTransfer $shareTransfer): bool
    {
        return $user->isManagerOfSomiti($shareTransfer->somiti_id)
            || $user->isOwnerOfSomiti($shareTransfer->somiti_id);
    }

    public function forceDelete(User $user, ShareTransfer $shareTransfer): bool
    {
        return $user->isOwnerOfSomiti($shareTransfer->somiti_id);
    }
}
