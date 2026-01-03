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
        // allow global permission
        if ($user->hasPermission('manage_notifications')) return true;

        // if notification targets a Somiti (notifiable_type), allow somiti members/managers/owner
        if ($notification->notifiable_type === \App\Models\Somiti::class && $notification->somiti_id) {
            return $user->isMemberOfSomiti($notification->somiti_id) || $user->isManagerOfSomiti($notification->somiti_id) || $user->isOwnerOfSomiti($notification->somiti_id);
        }

        // personal notification (user-specific)
        if ($notification->user_id) {
            return $user->id === $notification->user_id;
        }

        return false;
    }

    public function markRead(User $user, Notification $notification): bool
    {
        return $this->view($user, $notification) || ($notification->notifiable_type === \App\Models\Somiti::class && $user->isManagerOfSomiti($notification->somiti_id));
    }

    public function delete(User $user, Notification $notification): bool
    {
        // if somiti-targeted, managers/owners can delete
        if ($notification->notifiable_type === \App\Models\Somiti::class && $notification->somiti_id) {
            return $user->isManagerOfSomiti($notification->somiti_id) || $user->isOwnerOfSomiti($notification->somiti_id);
        }

        // allow recipient
        if ($notification->user_id) {
            return $user->id === $notification->user_id;
        }

        return false;
    }
}
