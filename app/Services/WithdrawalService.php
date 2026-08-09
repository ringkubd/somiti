<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\Somiti;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;

class WithdrawalService
{
    /**
     * Create a withdrawal request.
     */
    public static function create(Somiti $somiti, int $userId, array $data): Withdrawal
    {
        $amount = (float) $data['amount'];

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Withdrawal amount must be greater than zero.');
        }

        $savingsBalance = AccountingService::getMemberBalance($userId, ChartOfAccount::CODE_MEMBER_SAVINGS, $somiti->id);

        if ($amount > $savingsBalance + 0.005) {
            throw new \InvalidArgumentException('Withdrawal exceeds your current savings balance.');
        }

        return Withdrawal::create([
            'somiti_id' => $somiti->id,
            'user_id' => $userId,
            'amount' => $amount,
            'reason' => $data['reason'] ?? null,
            'method' => $data['method'] ?? null,
            'status' => 'pending',
        ]);
    }

    /**
     * Approve a withdrawal — journal Debit Member Savings / Credit Cash.
     * Idempotent: skips if a journal entry already exists.
     */
    public static function approve(Withdrawal $withdrawal, int $approverId): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $approverId) {
            $savingsBalance = AccountingService::getMemberBalance($withdrawal->user_id, ChartOfAccount::CODE_MEMBER_SAVINGS, $withdrawal->somiti_id);

            if ((float) $withdrawal->amount > $savingsBalance + 0.005) {
                throw new \InvalidArgumentException('Member savings balance is insufficient for this withdrawal.');
            }

            $exists = \App\Models\JournalEntry::where('reference_type', Withdrawal::class)
                ->where('reference_id', $withdrawal->id)
                ->exists();

            if (! $exists) {
                AccountingService::recordWithdrawal($withdrawal);
            }

            $withdrawal->approve($approverId);

            return $withdrawal;
        });
    }
}
