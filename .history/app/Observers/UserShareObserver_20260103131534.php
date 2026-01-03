<?php

namespace App\Observers;

use App\Models\Ledger;
use App\Models\Share;
use App\Models\UserShare;

class UserShareObserver
{
    public function created(UserShare $userShare): void
    {
        // Calculate amount from share_price if a Share exists for this somiti and financial year
        $share = Share::where('somiti_id', $userShare->somiti_id)
            ->where('financial_year_id', $userShare->financial_year_id)
            ->first();

        if (! $share) {
            return;
        }

        $amount = $share->share_price * $userShare->share_count;

        $exists = Ledger::where('reference_type', UserShare::class)
            ->where('reference_id', $userShare->id)
            ->where('credit', $amount)
            ->exists();

        if ($exists) {
            return;
        }

        // Record a credit for shares issued (assume credit increases user/share liability)
        Ledger::create([
            'somiti_id' => $userShare->somiti_id,
            'reference_id' => $userShare->id,
            'reference_type' => UserShare::class,
            'debit' => 0,
            'credit' => $amount,
            'description' => 'Share purchase: ' . $userShare->share_count . ' shares at ' . $share->share_price,
        ]);
    }
}
