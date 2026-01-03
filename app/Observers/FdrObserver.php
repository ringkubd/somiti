<?php

namespace App\Observers;

use App\Models\Fdr;
use App\Models\Ledger;

class FdrObserver
{
    public function created(Fdr $fdr): void
    {
        if (empty($fdr->maturity_amount)) {
            return;
        }

        $exists = Ledger::where('reference_type', Fdr::class)
            ->where('reference_id', $fdr->id)
            ->where('debit', $fdr->maturity_amount)
            ->exists();

        if ($exists) {
            return;
        }

        Ledger::create([
            'somiti_id' => $fdr->somiti_id,
            'reference_id' => $fdr->id,
            'reference_type' => Fdr::class,
            'debit' => $fdr->maturity_amount,
            'credit' => 0,
            'description' => 'FDR created at ' . $fdr->bank_name,
        ]);
    }
}
