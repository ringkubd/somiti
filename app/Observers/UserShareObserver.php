<?php

namespace App\Observers;

use App\Models\UserShare;
use App\Services\AccountingService;

class UserShareObserver
{
    public function created(UserShare $userShare): void
    {
        $share = \App\Models\Share::where('somiti_id', $userShare->somiti_id)
            ->where('financial_year_id', $userShare->financial_year_id)
            ->first();

        if (! $share) {
            return;
        }

        $exists = \App\Models\JournalEntry::where('reference_type', UserShare::class)
            ->where('reference_id', $userShare->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordSharePurchase($userShare);
    }
}
