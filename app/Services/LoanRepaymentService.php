<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Support\Facades\DB;

class LoanRepaymentService
{
    /**
     * Create a repayment request for a loan.
     */
    public static function create(Loan $loan, int $userId, array $data): LoanRepayment
    {
        return DB::transaction(function () use ($loan, $userId, $data) {
            if ($loan->status !== 'disbursed') {
                throw new \InvalidArgumentException('Only disbursed loans can be repaid.');
            }

            $amount = (float) $data['amount'];
            $outstanding = (float) $loan->outstanding_balance;

            if ($amount <= 0) {
                throw new \InvalidArgumentException('Repayment amount must be greater than zero.');
            }

            if ($outstanding <= 0) {
                throw new \InvalidArgumentException('This loan has no outstanding balance.');
            }

            $portions = self::calculatePortions($loan, $amount);
            $maxPayment = $outstanding + $portions['interest_portion'];

            if ($amount > $maxPayment + 0.005) {
                throw new \InvalidArgumentException('Repayment amount exceeds the outstanding balance plus interest due.');
            }

            $principal = min($portions['principal_portion'], $outstanding);
            $interest = round($amount - $principal, 2);

            return LoanRepayment::create([
                'loan_id' => $loan->id,
                'somiti_id' => $loan->somiti_id,
                'user_id' => $userId,
                'amount' => $amount,
                'principal_portion' => $principal,
                'interest_portion' => $interest,
                'payment_date' => $data['payment_date'] ?? now()->toDateString(),
                'method' => $data['method'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Split a payment into principal and interest portions.
     *
     * Flat interest: interest is fixed as (principal × rate × term) / term per period.
     * Reducing balance: interest is (outstanding × annual rate / 100) / 12 for the period.
     */
    public static function calculatePortions(Loan $loan, float $amount): array
    {
        $outstanding = (float) $loan->outstanding_balance;
        $rate = (float) $loan->interest_rate;
        $term = (int) ($loan->term_months ?: 1);

        if ($loan->interest_type === 'reducing') {
            $monthlyRate = $rate / 100 / 12;
            $interest = round($outstanding * $monthlyRate, 2);
        } else {
            // flat: per-month interest based on the original loan amount
            $totalInterest = ((float) $loan->amount) * $rate / 100;
            $interest = round($totalInterest / $term, 2);
        }

        $interest = min($interest, $amount);
        $principal = round($amount - $interest, 2);

        return [
            'principal_portion' => $principal,
            'interest_portion' => $interest,
        ];
    }
}
