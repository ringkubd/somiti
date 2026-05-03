<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\DividendAllocation;
use App\Models\DividendDeclaration;
use App\Models\FinancialYear;
use App\Models\JournalEntryLine;
use App\Models\UserShare;
use Illuminate\Support\Facades\DB;

class DividendService
{
    /**
     * Calculate net profit for a somiti in a given period.
     * Net profit = Total Income - Total Expense
     */
    public static function calculateProfit(int $somitiId, int $financialYearId): float
    {
        $totalIncome = JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_INCOME)->where('somiti_id', $somitiId))
            ->sum('credit')
            - JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
                ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_INCOME)->where('somiti_id', $somitiId))
                ->sum('debit');

        $totalExpense = JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_EXPENSE)->where('somiti_id', $somitiId))
            ->sum('debit')
            - JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
                ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_EXPENSE)->where('somiti_id', $somitiId))
                ->sum('credit');

        return max(0, $totalIncome - $totalExpense);
    }

    /**
     * Calculate the total member shares for dividend purposes.
     */
    public static function calculateTotalShares(int $somitiId, int $financialYearId): int
    {
        return (int) UserShare::where('somiti_id', $somitiId)
            ->where('financial_year_id', $financialYearId)
            ->sum('share_count');
    }

    /**
     * Declare a dividend (calculate and create per-member allocations).
     */
    public static function declareDividend(
        int $somitiId,
        int $financialYearId,
        float $totalProfit,
        float $dividendRate,
        string $profitPeriod,
        int $declaredBy,
    ): DividendDeclaration {
        return DB::transaction(function () use ($somitiId, $financialYearId, $totalProfit, $dividendRate, $profitPeriod, $declaredBy) {
            $totalDividend = round($totalProfit * ($dividendRate / 100), 2);

            $declaration = DividendDeclaration::create([
                'somiti_id' => $somitiId,
                'financial_year_id' => $financialYearId,
                'total_profit' => $totalProfit,
                'profit_period' => $profitPeriod,
                'dividend_rate' => $dividendRate,
                'total_dividend' => $totalDividend,
                'status' => 'pending',
                'declared_by' => $declaredBy,
                'declared_at' => now(),
            ]);

            // Calculate per-member allocations
            $totalShares = self::calculateTotalShares($somitiId, $financialYearId);
            $dividendPerShare = $totalShares > 0
                ? round($totalDividend / $totalShares, 2)
                : 0;

            $members = UserShare::where('somiti_id', $somitiId)
                ->where('financial_year_id', $financialYearId)
                ->where('share_count', '>', 0)
                ->get();

            foreach ($members as $memberShare) {
                $memberDividend = round($memberShare->share_count * $dividendPerShare, 2);

                DividendAllocation::create([
                    'dividend_declaration_id' => $declaration->id,
                    'user_id' => $memberShare->user_id,
                    'share_count' => $memberShare->share_count,
                    'dividend_per_share' => $dividendPerShare,
                    'total_dividend' => $memberDividend,
                    'status' => 'pending',
                ]);
            }

            return $declaration;
        });
    }

    /**
     * Pay declared dividends — creates journal entries for each member.
     */
    public static function payDividends(DividendDeclaration $declaration): void
    {
        DB::transaction(function () use ($declaration) {
            $allocations = $declaration->allocations()->where('status', 'pending')->get();

            foreach ($allocations as $allocation) {
                $entry = AccountingService::recordPayout(
                    $declaration->somiti_id,
                    $declaration,
                    $allocation->user_id,
                    $allocation->total_dividend,
                    "Dividend payment for {$declaration->profit_period}"
                );

                $allocation->update([
                    'status' => 'paid',
                    'journal_entry_id' => $entry->id,
                ]);
            }

            $declaration->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        });
    }

    /**
     * Get a dividend preview without creating records.
     */
    public static function previewDividend(
        int $somitiId,
        int $financialYearId,
        float $totalProfit,
        float $dividendRate,
    ): array {
        $totalDividend = round($totalProfit * ($dividendRate / 100), 2);
        $totalShares = self::calculateTotalShares($somitiId, $financialYearId);
        $dividendPerShare = $totalShares > 0
            ? round($totalDividend / $totalShares, 2)
            : 0;

        $members = UserShare::where('somiti_id', $somitiId)
            ->where('financial_year_id', $financialYearId)
            ->where('share_count', '>', 0)
            ->get()
            ->map(fn ($ms) => [
                'user_id' => $ms->user_id,
                'user_name' => $ms->user->name,
                'share_count' => $ms->share_count,
                'dividend_per_share' => $dividendPerShare,
                'total_dividend' => round($ms->share_count * $dividendPerShare, 2),
            ]);

        return [
            'total_profit' => $totalProfit,
            'dividend_rate' => $dividendRate,
            'total_dividend' => $totalDividend,
            'total_shares' => $totalShares,
            'dividend_per_share' => $dividendPerShare,
            'members' => $members,
        ];
    }

    /**
     * Close a financial year — reconcile and lock.
     */
    public static function closeFinancialYear(FinancialYear $financialYear): void
    {
        DB::transaction(function () use ($financialYear) {
            // Verify trial balance is balanced
            $trialBalance = AccountingService::verifyBalances($financialYear->somiti_id);
            if (! $trialBalance['balanced']) {
                throw new \RuntimeException('Cannot close financial year: unbalanced journal entries exist.');
            }

            $financialYear->update([
                'is_active' => false,
                'is_closed' => true,
                'closed_at' => now(),
            ]);
        });
    }
}
