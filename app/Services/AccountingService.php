<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\Deposit;
use App\Models\Fdr;
use App\Models\Investment;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\Loan;
use App\Models\Share;
use App\Models\ShareTransfer;
use App\Models\UserShare;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Seed the standard chart of accounts for a somiti.
     */
    public static function seedChartOfAccounts(int $somitiId): void
    {
        $accounts = [
            ['code' => ChartOfAccount::CODE_CASH, 'name' => 'Cash', 'type' => ChartOfAccount::TYPE_ASSET, 'normal_balance' => ChartOfAccount::NORMAL_DEBIT],
            ['code' => ChartOfAccount::CODE_MEMBER_SAVINGS, 'name' => 'Member Savings', 'type' => ChartOfAccount::TYPE_LIABILITY, 'normal_balance' => ChartOfAccount::NORMAL_CREDIT],
            ['code' => ChartOfAccount::CODE_SHARE_CAPITAL, 'name' => 'Share Capital', 'type' => ChartOfAccount::TYPE_EQUITY, 'normal_balance' => ChartOfAccount::NORMAL_CREDIT],
            ['code' => ChartOfAccount::CODE_LOANS_RECEIVABLE, 'name' => 'Loans Receivable', 'type' => ChartOfAccount::TYPE_ASSET, 'normal_balance' => ChartOfAccount::NORMAL_DEBIT],
            ['code' => ChartOfAccount::CODE_INVESTMENTS, 'name' => 'Investments', 'type' => ChartOfAccount::TYPE_ASSET, 'normal_balance' => ChartOfAccount::NORMAL_DEBIT],
            ['code' => ChartOfAccount::CODE_FDR_ASSET, 'name' => 'FDR Asset', 'type' => ChartOfAccount::TYPE_ASSET, 'normal_balance' => ChartOfAccount::NORMAL_DEBIT],
            ['code' => ChartOfAccount::CODE_INCOME_INTEREST, 'name' => 'Interest Income', 'type' => ChartOfAccount::TYPE_INCOME, 'normal_balance' => ChartOfAccount::NORMAL_CREDIT],
            ['code' => ChartOfAccount::CODE_EXPENSE_INTEREST, 'name' => 'Interest Expense', 'type' => ChartOfAccount::TYPE_EXPENSE, 'normal_balance' => ChartOfAccount::NORMAL_DEBIT],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::firstOrCreate(
                ['somiti_id' => $somitiId, 'code' => $account['code']],
                $account
            );
        }
    }

    /**
     * Record a deposit: Debit Cash, Credit Member Savings.
     */
    public static function recordDeposit(Deposit $deposit): JournalEntry
    {
        return DB::transaction(function () use ($deposit) {
            $entry = self::createJournalEntry($deposit->somiti_id, $deposit, "Deposit approval #{$deposit->id}");

            self::addLine($entry, ChartOfAccount::CODE_CASH, $deposit->amount, 0, null, 'Cash received');
            self::addLine($entry, ChartOfAccount::CODE_MEMBER_SAVINGS, 0, $deposit->amount, $deposit->user_id, 'Member savings');

            return $entry;
        });
    }

    /**
     * Record a loan disbursement: Debit Loans Receivable, Credit Cash.
     */
    public static function recordLoanDisbursement(Loan $loan): JournalEntry
    {
        return DB::transaction(function () use ($loan) {
            $entry = self::createJournalEntry($loan->somiti_id, $loan, "Loan disbursement #{$loan->id}");

            self::addLine($entry, ChartOfAccount::CODE_LOANS_RECEIVABLE, $loan->amount, 0, $loan->user_id, 'Loan receivable');
            self::addLine($entry, ChartOfAccount::CODE_CASH, 0, $loan->amount, null, 'Cash disbursed');

            return $entry;
        });
    }

    /**
     * Record a share purchase: Debit Cash, Credit Share Capital.
     */
    public static function recordSharePurchase(UserShare $userShare): JournalEntry
    {
        $share = Share::where('somiti_id', $userShare->somiti_id)
            ->where('financial_year_id', $userShare->financial_year_id)
            ->first();

        if (! $share) {
            throw new \InvalidArgumentException('Share pricing not found for this financial year.');
        }

        $amount = $share->share_price * $userShare->share_count;

        return DB::transaction(function () use ($userShare, $amount) {
            $entry = self::createJournalEntry($userShare->somiti_id, $userShare, "Share purchase #{$userShare->id}");

            self::addLine($entry, ChartOfAccount::CODE_CASH, $amount, 0, null, 'Cash received from share purchase');
            self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, 0, $amount, $userShare->user_id, 'Share capital');

            return $entry;
        });
    }

    /**
     * Record a share transfer between members.
     * No cash changes hands in the fund — only reallocation of share capital.
     */
    public static function recordShareTransfer(ShareTransfer $transfer): JournalEntry
    {
        $totalValue = $transfer->quantity * $transfer->price_per_share;

        return DB::transaction(function () use ($transfer, $totalValue) {
            $description = $transfer->from_user_id
                ? "Share transfer #{$transfer->id}: User {$transfer->from_user_id} → User {$transfer->to_user_id}"
                : "Treasury issuance #{$transfer->id} to User {$transfer->to_user_id}";

            $entry = self::createJournalEntry($transfer->somiti_id, $transfer, $description);

            if ($transfer->from_user_id) {
                // Peer-to-peer: reallocate share capital between members
                self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, $totalValue, 0, $transfer->from_user_id, 'Share capital transferred out');
                self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, 0, $totalValue, $transfer->to_user_id, 'Share capital transferred in');
            } else {
                // Treasury issuance: fund receives cash, issues shares
                self::addLine($entry, ChartOfAccount::CODE_CASH, $totalValue, 0, null, 'Cash from treasury issuance');
                self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, 0, $totalValue, $transfer->to_user_id, 'Share capital issued');
            }

            return $entry;
        });
    }

    /**
     * Record an investment: Debit Investments, Credit Cash.
     */
    public static function recordInvestment(Investment $investment): JournalEntry
    {
        return DB::transaction(function () use ($investment) {
            $entry = self::createJournalEntry($investment->somiti_id, $investment, "Investment approval #{$investment->id}");

            self::addLine($entry, ChartOfAccount::CODE_INVESTMENTS, $investment->amount, 0, null, 'Investment');
            self::addLine($entry, ChartOfAccount::CODE_CASH, 0, $investment->amount, null, 'Cash paid for investment');

            return $entry;
        });
    }

    /**
     * Record an FDR approval: Debit FDR Asset, Credit Cash.
     */
    public static function recordFdr(Fdr $fdr): JournalEntry
    {
        if (empty($fdr->maturity_amount)) {
            throw new \InvalidArgumentException('FDR maturity amount is required.');
        }

        return DB::transaction(function () use ($fdr) {
            $entry = self::createJournalEntry($fdr->somiti_id, $fdr, "FDR approval #{$fdr->id} at {$fdr->bank_name}");

            self::addLine($entry, ChartOfAccount::CODE_FDR_ASSET, $fdr->maturity_amount, 0, null, 'FDR deposit');
            self::addLine($entry, ChartOfAccount::CODE_CASH, 0, $fdr->maturity_amount, null, 'Cash moved to FDR');

            return $entry;
        });
    }

    /**
     * Record a share price appreciation/depreciation.
     */
    public static function recordShareRevaluation(Share $share, float $originalPrice, float $newPrice): JournalEntry
    {
        $delta = $newPrice - $originalPrice;
        $amount = abs($delta) * $share->total_shares;

        return DB::transaction(function () use ($share, $delta, $amount, $originalPrice, $newPrice) {
            $isGain = $delta > 0;
            $description = $isGain
                ? "Share price appreciation {$originalPrice} → {$newPrice}"
                : "Share price depreciation {$originalPrice} → {$newPrice}";

            $entry = self::createJournalEntry($share->somiti_id, $share, $description);

            if ($isGain) {
                self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, 0, $amount, null, 'Revaluation gain');
            } else {
                self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, $amount, 0, null, 'Revaluation loss');
            }
            self::addLine($entry, ChartOfAccount::CODE_SHARE_CAPITAL, $isGain ? $amount : 0, $isGain ? 0 : $amount, null, 'Revaluation contra');

            return $entry;
        });
    }

    /**
     * Get the net balance of an account for a somiti.
     */
    public static function getAccountBalance(string $accountCode, int $somitiId): float
    {
        $account = ChartOfAccount::where('somiti_id', $somitiId)->where('code', $accountCode)->first();
        if (! $account) {
            return 0;
        }

        $totalDebit = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->sum('debit');

        $totalCredit = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->sum('credit');

        if ($account->normal_balance === ChartOfAccount::NORMAL_DEBIT) {
            return (float) ($totalDebit - $totalCredit);
        }

        return (float) ($totalCredit - $totalDebit);
    }

    /**
     * Get the net balance for a specific member in a specific account.
     */
    public static function getMemberBalance(int $memberId, string $accountCode, int $somitiId): float
    {
        $account = ChartOfAccount::where('somiti_id', $somitiId)->where('code', $accountCode)->first();
        if (! $account) {
            return 0;
        }

        $totalDebit = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->where('member_id', $memberId)
            ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->sum('debit');

        $totalCredit = JournalEntryLine::where('chart_of_account_id', $account->id)
            ->where('member_id', $memberId)
            ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->sum('credit');

        if ($account->normal_balance === ChartOfAccount::NORMAL_DEBIT) {
            return (float) ($totalDebit - $totalCredit);
        }

        return (float) ($totalCredit - $totalDebit);
    }

    /**
     * Get trial balance for a somiti as of a date.
     */
    public static function getTrialBalance(int $somitiId, ?string $asOf = null): array
    {
        $accounts = ChartOfAccount::where('somiti_id', $somitiId)->where('is_active', true)->get();
        $result = [];

        foreach ($accounts as $account) {
            $query = JournalEntryLine::where('chart_of_account_id', $account->id)
                ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId));

            if ($asOf) {
                $query->whereHas('journalEntry', fn ($q) => $q->whereDate('created_at', '<=', $asOf));
            }

            $debit = (float) $query->sum('debit');
            $credit = (float) $query->sum('credit');

            $result[] = [
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $account->normal_balance === ChartOfAccount::NORMAL_DEBIT
                    ? $debit - $credit
                    : $credit - $debit,
            ];
        }

        return $result;
    }

    // ─── Private helpers ──────────────────────────────────────────

    private static function createJournalEntry(int $somitiId, object $reference, string $description): JournalEntry
    {
        return JournalEntry::create([
            'somiti_id' => $somitiId,
            'reference_id' => $reference->id,
            'reference_type' => get_class($reference),
            'entry_date' => now(),
            'description' => $description,
        ]);
    }

    private static function addLine(
        JournalEntry $entry,
        string $accountCode,
        float $debit,
        float $credit,
        ?int $memberId,
        string $description
    ): JournalEntryLine {
        $account = ChartOfAccount::where('somiti_id', $entry->somiti_id)
            ->where('code', $accountCode)
            ->firstOrFail();

        return $entry->lines()->create([
            'chart_of_account_id' => $account->id,
            'member_id' => $memberId,
            'debit' => $debit,
            'credit' => $credit,
            'description' => $description,
        ]);
    }

    /**
     * Record a dividend payout: Debit Expense, Credit Cash.
     */
    public static function recordPayout(int $somitiId, object $reference, int $memberId, float $amount, string $description): JournalEntry
    {
        return DB::transaction(function () use ($somitiId, $reference, $amount, $description) {
            $entry = self::createJournalEntry($somitiId, $reference, $description);

            self::addLine($entry, ChartOfAccount::CODE_EXPENSE_INTEREST, $amount, 0, null, 'Dividend payout');
            self::addLine($entry, ChartOfAccount::CODE_CASH, 0, $amount, null, 'Cash paid as dividend');

            return $entry;
        });
    }

    /**
     * Verify that all journal entries for a somiti are balanced.
     *
     * @return array{balanced: bool, unbalanced: array<int, array{id: int, debit: float, credit: float}>}
     */
    public static function verifyBalances(int $somitiId): array
    {
        $entries = JournalEntry::where('somiti_id', $somitiId)->with('lines')->get();
        $unbalanced = [];

        foreach ($entries as $entry) {
            if (! $entry->isBalanced()) {
                $unbalanced[] = [
                    'id' => $entry->id,
                    'debit' => $entry->totalDebit(),
                    'credit' => $entry->totalCredit(),
                ];
            }
        }

        return [
            'balanced' => empty($unbalanced),
            'unbalanced' => $unbalanced,
        ];
    }
}
