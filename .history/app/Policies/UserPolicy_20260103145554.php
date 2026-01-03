<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    public function view(User $user, User $model): bool
    {
        if ($user->id === $model->id) return true;

        return $this->manageAsSomitiAdmin($user, $model);
    }

    public function update(User $user, User $model): bool
    {
        if ($user->id === $model->id) return true;

        return $this->manageAsSomitiAdmin($user, $model);
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) return true;

        return $this->manageAsSomitiAdmin($user, $model);
    }

    protected function manageAsSomitiAdmin(User $user, User $target): bool
    {
        // find somitis where target is member
        $somitiIds = \DB::table('somiti_members')->where('user_id', $target->id)->pluck('somiti_id');

        foreach ($somitiIds as $sid) {
            if ($user->isOwnerOfSomiti($sid) || $user->isManagerOfSomiti($sid)) {
                return true;
            }
        }

        return false;
    }

    public function viewAny(User $user): bool
    {
        // No open user listing by default
        return false;
    }
}
