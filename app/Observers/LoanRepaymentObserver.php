<?php

namespace App\Observers;

use App\Models\LoanRepayment;
use App\Services\AccountingService;

class LoanRepaymentObserver
{
    public function updated(LoanRepayment $repayment): void
    {
        $originalStatus = $repayment->getOriginal('status');
        $newStatus = $repayment->status;

        if ($originalStatus === 'approved' || $newStatus !== 'approved') {
            return;
        }

        $exists = \App\Models\JournalEntry::where('reference_type', LoanRepayment::class)
            ->where('reference_id', $repayment->id)
            ->exists();

        if ($exists) {
            return;
        }

        AccountingService::recordLoanRepayment($repayment);

        $loan = $repayment->loan;
        $newBalance = max(0, (float) $loan->outstanding_balance - (float) $repayment->principal_portion);
        $loan->outstanding_balance = $newBalance;

        if ($newBalance <= 0) {
            $loan->status = 'closed';
        }

        $loan->save();

        \App\Models\Notification::sendToUser(
            $repayment->user,
            'Loan Repayment Approved',
            'Your loan repayment of $'.number_format($repayment->amount, 2).' has been approved.',
            $repayment->somiti,
            ['type' => 'repayment', 'id' => $repayment->loan_id]
        );
        \App\Models\Notification::sendToSomiti(
            $repayment->somiti,
            'Loan Repayment',
            $repayment->user->name.' repaid $'.number_format($repayment->amount, 2).' against their loan.'
        );

        event(new \App\Events\TransactionEvent(
            $repayment->user_id,
            'Your loan repayment of $'.number_format($repayment->amount, 2).' was approved!',
            'success',
            ['loan_repayment_id' => $repayment->id]
        ));
    }
}
