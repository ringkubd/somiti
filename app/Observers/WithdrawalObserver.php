<?php

namespace App\Observers;

use App\Models\Withdrawal;

class WithdrawalObserver
{
    public function updated(Withdrawal $withdrawal): void
    {
        $originalStatus = $withdrawal->getOriginal('status');
        $newStatus = $withdrawal->status;

        if ($originalStatus === 'approved' || $newStatus !== 'approved') {
            return;
        }

        \App\Models\Notification::sendToUser(
            $withdrawal->user,
            'Withdrawal Approved',
            'Your withdrawal of $'.number_format($withdrawal->amount, 2).' has been approved.',
            $withdrawal->somiti,
            ['type' => 'withdrawal', 'id' => $withdrawal->id]
        );
        \App\Models\Notification::sendToSomiti(
            $withdrawal->somiti,
            'Withdrawal Approved',
            $withdrawal->user->name.'\'s withdrawal of $'.number_format($withdrawal->amount, 2).' has been approved.'
        );

        event(new \App\Events\TransactionEvent(
            $withdrawal->user_id,
            'Your withdrawal of $'.number_format($withdrawal->amount, 2).' was approved!',
            'success',
            ['withdrawal_id' => $withdrawal->id]
        ));
    }
}
