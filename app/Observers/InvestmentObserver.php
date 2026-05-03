<?php

namespace App\Observers;

use App\Models\Investment;
use App\Services\AccountingService;

class InvestmentObserver
{
    public function updated(Investment $investment): void
    {
        $original = $investment->getOriginal('status');
        $new = $investment->status;

        if ($original === 'approved' || $new !== 'approved') {
            return;
        }

        $exists = \App\Models\JournalEntry::where('reference_type', Investment::class)
            ->where('reference_id', $investment->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordInvestment($investment);
    }
}
