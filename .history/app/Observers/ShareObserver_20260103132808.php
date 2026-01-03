<?php

namespace App\Observers;

use App\Models\Ledger;
use App\Models\Share;

class ShareObserver
{
    public function updated(Share $share): void
    {
        $originalPrice = $share->getOriginal('share_price');
        $newPrice = $share->share_price;

        if ($originalPrice == $newPrice) {
            return;
        }

        $delta = $newPrice - $originalPrice;
        $amount = abs($delta) * $share->total_shares;

        if ($amount == 0) {
            return;
        }

        // Positive delta -> revaluation gain (credit); negative -> loss (debit)
        if ($delta > 0) {
            Ledger::createUnique([
                'somiti_id' => $share->somiti_id,
                'reference_id' => $share->id,
                'reference_type' => Share::class,
                'debit' => 0,
                'credit' => $amount,
                'description' => 'Share price appreciation from ' . $originalPrice . ' to ' . $newPrice,
            ]);
        } else {
            Ledger::createUnique([
                'somiti_id' => $share->somiti_id,
                'reference_id' => $share->id,
                'reference_type' => Share::class,
                'debit' => $amount,
                'credit' => 0,
                'description' => 'Share price depreciation from ' . $originalPrice . ' to ' . $newPrice,
            ]);
        }
    }
}
