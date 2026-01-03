<?php

namespace App\Observers;

use App\Models\Investment;
use App\Models\Ledger;

class InvestmentObserver
{
    public function updated(Investment $investment): void
    {
        $original = $investment->getOriginal('status');
        $new = $investment->status;

        if ($original !== 'approved' && $new === 'approved') {
            // avoid duplicate
            $exists = Ledger::where('reference_type', Investment::class)
                ->where('reference_id', $investment->id)
                ->where('debit', $investment->amount)
                ->exists();

            if ($exists) {
                return;
            }

            Ledger::create([
                'somiti_id' => $investment->somiti_id,
                'reference_id' => $investment->id,
                'reference_type' => Investment::class,
                'debit' => $investment->amount,
                'credit' => 0,
                'description' => 'Investment approved: ' . $investment->type,
            ]);
        }
    }
}
