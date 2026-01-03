<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;
use App\Models\Somiti;
use Illuminate\Auth\Access\HandlesAuthorization;

class NotificationPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Notification $notification): bool
    {
        // personal notification
        if ($notification->user_id) {
            return $user->id === $notification->user_id;
        }

        // somiti-wide notification: allow members/managers/owner of the somiti
        if ($notification->somiti_id) {
            return $user->isMemberOfSomiti($notification->somiti_id) || $user->isManagerOfSomiti($notification->somiti_id) || $user->isOwnerOfSomiti($notification->somiti_id);
        }

        return false;
    }

    public function markRead(User $user, Notification $notification): bool
    {
        return $this->view($user, $notification);
    }

    public function delete(User $user, Notification $notification): bool
    {
        // allow recipient or somiti manager/owner to delete
        if ($notification->user_id) {
            return $user->id === $notification->user_id;
        }

        if ($notification->somiti_id) {
            return $user->isManagerOfSomiti($notification->somiti_id) || $user->isOwnerOfSomiti($notification->somiti_id);
        }

        return false;
    }
}
