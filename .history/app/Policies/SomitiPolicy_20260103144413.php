<?php

namespace App\Policies;

use App\Models\Somiti;
use App\Models\User;

class SomitiPolicy
{
    public function view(User $user, Somiti $somiti): bool
    {
        // Members, managers, and owner may view
        return $user->isMemberOfSomiti($somiti) || $user->isManagerOfSomiti($somiti) || $user->isOwnerOfSomiti($somiti);
    }

    public function update(User $user, Somiti $somiti): bool
    {
        // Only owner or manager
        return $user->isOwnerOfSomiti($somiti) || $user->isManagerOfSomiti($somiti);
    }

    public function delete(User $user, Somiti $somiti): bool
    {
        // Only owner
        return $user->isOwnerOfSomiti($somiti);
    }

    public function manageMembers(User $user, Somiti $somiti): bool
    {
        // Owner or manager can manage members
        return $user->isOwnerOfSomiti($somiti) || $user->isManagerOfSomiti($somiti);
    }

    public function setActiveYear(User $user, Somiti $somiti): bool
    {
        // Owner or manager
        return $this->update($user, $somiti);
    }
}
