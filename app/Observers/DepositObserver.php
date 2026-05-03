<?php

namespace App\Observers;

use App\Models\Deposit;
use App\Services\AccountingService;

class DepositObserver
{
    public function updated(Deposit $deposit): void
    {
        $originalStatus = $deposit->getOriginal('status');
        $newStatus = $deposit->status;

        if ($originalStatus === 'approved' || $newStatus !== 'approved') {
            return;
        }

        // Idempotency: check if journal entry already exists
        $exists = \App\Models\JournalEntry::where('reference_type', Deposit::class)
            ->where('reference_id', $deposit->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordDeposit($deposit);

        \App\Models\Notification::sendToUser(
            $deposit->user,
            'Deposit Approved',
            'Your deposit of $'.number_format($deposit->amount, 2).' has been approved.',
            $deposit->somiti
        );

        event(new \App\Events\TransactionEvent(
            $deposit->user_id,
            'Your deposit of $'.number_format($deposit->amount, 2).' was approved!',
            'success',
            ['deposit_id' => $deposit->id]
        ));
    }
}
