<?php

namespace App\Observers;

use App\Models\Loan;
use App\Models\Ledger;
use Illuminate\Support\Str;

class LoanObserver
{
    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        $originalStatus = $loan->getOriginal('status');
        $newStatus = $loan->status;

        // When loan is approved or disbursed, create ledger entry for disbursement
        if ($originalStatus !== 'approved' && $newStatus === 'approved') {
            // If loan 'approved' means disbursed in your flow, create debit ledger
            $exists = Ledger::where('reference_type', Loan::class)
                ->where('reference_id', $loan->id)
                ->where('debit', $loan->amount)
                ->exists();

            if ($exists) {
                return;
            }

            Ledger::create([
                'somiti_id' => $loan->somiti_id,
                'reference_id' => $loan->id,
                'reference_type' => Loan::class,
                'debit' => $loan->amount,
                'credit' => 0,
                'description' => 'Loan approved/disbursed, user_id:' . $loan->user_id,
            ]);
        }

        // If you use 'disbursed' status, also handle that
        if ($originalStatus !== 'disbursed' && $newStatus === 'disbursed') {
            $exists = Ledger::where('reference_type', Loan::class)
                ->where('reference_id', $loan->id)
                ->where('debit', $loan->amount)
                ->exists();

            if ($exists) {
                return;
            }

            Ledger::create([
                'somiti_id' => $loan->somiti_id,
                'reference_id' => $loan->id,
                'reference_type' => Loan::class,
                'debit' => $loan->amount,
                'credit' => 0,
                'description' => 'Loan disbursed, user_id:' . $loan->user_id,
            ]);
        }
    }
}
