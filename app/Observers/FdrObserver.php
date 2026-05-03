<?php

namespace App\Observers;

use App\Models\Fdr;
use App\Services\AccountingService;

class FdrObserver
{
    public function updated(Fdr $fdr): void
    {
        $originalStatus = $fdr->getOriginal('status');
        $newStatus = $fdr->status;

        if ($originalStatus === 'approved' || $newStatus !== 'approved') {
            return;
        }

        if (empty($fdr->maturity_amount)) {
            return;
        }

        $exists = \App\Models\JournalEntry::where('reference_type', Fdr::class)
            ->where('reference_id', $fdr->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordFdr($fdr);
    }
}
