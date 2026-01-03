<?php

namespace App\Observers;

use App\Models\Deposit;
use App\Models\Ledger;
use Illuminate\Support\Str;

class DepositObserver
{
    /**
     * Handle the Deposit "updated" event.
     */
    public function updated(Deposit $deposit): void
    {
        $originalStatus = $deposit->getOriginal('status');
        $newStatus = $deposit->status;

        // Only act on status change to 'approved'
        if ($originalStatus !== 'approved' && $newStatus === 'approved') {
            // Avoid duplicate ledger entries for same deposit and amount
            $exists = Ledger::where('reference_type', Deposit::class)
                ->where('reference_id', $deposit->id)
                ->where('credit', $deposit->amount)
                ->exists();

            if ($exists) {
                return;
            }

            Ledger::create([
                'somiti_id' => $deposit->somiti_id,
                'reference_id' => $deposit->id,
                'reference_type' => Deposit::class,
                'debit' => 0,
                'credit' => $deposit->amount,
                'description' => 'Deposit approved (' . Str::upper($deposit->type) . ') by user_id:' . $deposit->approved_by,
            ]);
        }
    }
}
