<?php

namespace App\Observers;

use App\Models\Penalty;
use App\Services\AccountingService;

class PenaltyObserver
{
    public function updated(Penalty $penalty): void
    {
        $originalStatus = $penalty->getOriginal('status');
        $newStatus = $penalty->status;

        if ($originalStatus === 'approved' || $newStatus !== 'approved') {
            return;
        }

        $exists = \App\Models\JournalEntry::where('reference_type', Penalty::class)
            ->where('reference_id', $penalty->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordPenalty($penalty);

        \App\Models\Notification::sendToUser(
            $penalty->user,
            'Penalty Applied',
            'A penalty of $'.number_format($penalty->amount, 2).' has been applied to your account.',
            $penalty->somiti
        );

        event(new \App\Events\TransactionEvent(
            $penalty->user_id,
            'A penalty of $'.number_format($penalty->amount, 2).' was applied.',
            'warning',
            ['penalty_id' => $penalty->id]
        ));
    }
}
