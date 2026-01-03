<?php

namespace App\Policies;

use App\Models\FinancialYear;
use App\Models\User;

class FinancialYearPolicy
{
    public function view(User $user, FinancialYear $fy): bool
    {
        return $user->isMemberOfSomiti($fy->somiti_id) || $user->isManagerOfSomiti($fy->somiti_id) || $user->isOwnerOfSomiti($fy->somiti_id);
    }

    public function create(User $user, $somitiId): bool
    {
        return $user->isManagerOfSomiti($somitiId) || $user->isOwnerOfSomiti($somitiId);
    }

    public function setActive(User $user, FinancialYear $fy): bool
    {
        return $user->isManagerOfSomiti($fy->somiti_id) || $user->isOwnerOfSomiti($fy->somiti_id);
    }

    public function delete(User $user, FinancialYear $fy): bool
    {
        return $user->isOwnerOfSomiti($fy->somiti_id);
    }
}
