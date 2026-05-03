<?php

namespace App\Observers;

use App\Models\Share;
use App\Services\AccountingService;

class ShareObserver
{
    public function updated(Share $share): void
    {
        $originalPrice = $share->getOriginal('share_price');
        $newPrice = $share->share_price;

        if ($originalPrice == $newPrice) {
            return;
        }

        AccountingService::recordShareRevaluation($share, (float) $originalPrice, (float) $newPrice);
    }
}
