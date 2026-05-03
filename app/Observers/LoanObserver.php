<?php

namespace App\Observers;

use App\Models\Loan;
use App\Services\AccountingService;

class LoanObserver
{
    public function updated(Loan $loan): void
    {
        $originalStatus = $loan->getOriginal('status');
        $newStatus = $loan->status;

        // Approval: notification only, no ledger entry
        if ($originalStatus !== 'approved' && $newStatus === 'approved') {
            \App\Models\Notification::sendToUser(
                $loan->user,
                'Loan Approved',
                'Your loan application for $'.number_format($loan->amount, 2).' has been approved.',
                $loan->somiti
            );

            event(new \App\Events\TransactionEvent(
                $loan->user_id,
                'Your loan of $'.number_format($loan->amount, 2).' was approved!',
                'success',
                ['loan_id' => $loan->id]
            ));
        }

        // Disbursement: create double-entry journal
        if ($originalStatus !== 'disbursed' && $newStatus === 'disbursed') {
            $exists = \App\Models\JournalEntry::where('reference_type', Loan::class)
                ->where('reference_id', $loan->id)
                ->exists();

            if (! $exists) {
                AccountingService::recordLoanDisbursement($loan);
            }

            \App\Models\Notification::sendToUser(
                $loan->user,
                'Loan Disbursed',
                'Funds for your loan ($'.number_format($loan->amount, 2).') have been disbursed.',
                $loan->somiti
            );

            event(new \App\Events\TransactionEvent(
                $loan->user_id,
                'Loan funds ($'.number_format($loan->amount, 2).') disbursed!',
                'info',
                ['loan_id' => $loan->id]
            ));
        }
    }
}
