<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\DividendAllocation;
use App\Models\Fdr;
use App\Models\Investment;
use App\Models\JournalEntryLine;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\UserShare;

class ReportService
{
    private static function accountBalance(int $somitiId, string $code): float
    {
        return (float) AccountingService::getAccountBalance($code, $somitiId);
    }

    /**
     * Total income minus total expenses (retained earnings / net position).
     */
    public static function retainedEarnings(int $somitiId): float
    {
        $income = JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_INCOME))
            ->get()
            ->sum(fn ($l) => (float) $l->credit - (float) $l->debit);

        $expense = JournalEntryLine::whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somitiId))
            ->whereHas('chartOfAccount', fn ($q) => $q->where('type', ChartOfAccount::TYPE_EXPENSE))
            ->get()
            ->sum(fn ($l) => (float) $l->debit - (float) $l->credit);

        return $income + $expense;
    }

    /**
     * Balance sheet: Assets = Liabilities + Equity.
     */
    public static function balanceSheet(Somiti $somiti): array
    {
        $cash = self::accountBalance($somiti->id, ChartOfAccount::CODE_CASH);
        $bank = (float) BankAccount::where('somiti_id', $somiti->id)->where('is_active', true)->sum('current_balance');
        $investments = self::accountBalance($somiti->id, ChartOfAccount::CODE_INVESTMENTS);
        $fdr = self::accountBalance($somiti->id, ChartOfAccount::CODE_FDR_ASSET);
        $loansReceivable = self::accountBalance($somiti->id, ChartOfAccount::CODE_LOANS_RECEIVABLE);

        $memberSavings = self::accountBalance($somiti->id, ChartOfAccount::CODE_MEMBER_SAVINGS);
        $shareCapital = self::accountBalance($somiti->id, ChartOfAccount::CODE_SHARE_CAPITAL);
        $retained = self::retainedEarnings($somiti->id);

        $totalAssets = $cash + $bank + $investments + $fdr + $loansReceivable;
        $totalLiabilities = $memberSavings;
        $totalEquity = $shareCapital + $retained;

        return [
            'currency_symbol' => $somiti->currency_symbol ?? '$',
            'as_of' => now()->toDateString(),
            'assets' => [
                ['code' => 'Cash', 'name' => 'Cash on Hand', 'amount' => $cash],
                ['code' => 'Bank', 'name' => 'Bank Accounts', 'amount' => $bank],
                ['code' => 'Investments', 'name' => 'Investments', 'amount' => $investments],
                ['code' => 'FDR', 'name' => 'Fixed Deposits (FDR)', 'amount' => $fdr],
                ['code' => 'Loans', 'name' => 'Loans Receivable', 'amount' => $loansReceivable],
            ],
            'liabilities' => [
                ['code' => 'Savings', 'name' => 'Member Savings', 'amount' => $memberSavings],
            ],
            'equity' => [
                ['code' => 'ShareCapital', 'name' => 'Share Capital', 'amount' => $shareCapital],
                ['code' => 'Retained', 'name' => 'Retained Earnings', 'amount' => $retained],
            ],
            'total_assets' => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            'total_equity' => $totalEquity,
            'balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
        ];
    }

    /**
     * Profit & loss statement (income − expenses).
     */
    public static function profitLoss(Somiti $somiti): array
    {
        $incomeAccounts = ChartOfAccount::where('somiti_id', $somiti->id)->where('type', ChartOfAccount::TYPE_INCOME)->where('is_active', true)->get();
        $expenseAccounts = ChartOfAccount::where('somiti_id', $somiti->id)->where('type', ChartOfAccount::TYPE_EXPENSE)->where('is_active', true)->get();

        $income = $incomeAccounts->map(fn ($a) => [
            'code' => $a->code, 'name' => $a->name, 'amount' => self::accountBalance($somiti->id, $a->code),
        ]);
        $expenses = $expenseAccounts->map(fn ($a) => [
            'code' => $a->code, 'name' => $a->name, 'amount' => self::accountBalance($somiti->id, $a->code),
        ]);

        $totalIncome = (float) $income->sum('amount');
        $totalExpense = (float) $expenses->sum('amount');

        return [
            'currency_symbol' => $somiti->currency_symbol ?? '$',
            'period' => now()->format('F Y'),
            'income' => $income,
            'expenses' => $expenses,
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpense,
            'net_profit' => $totalIncome - $totalExpense,
        ];
    }

    /**
     * Where the fund lives: allocation across cash, bank, investments, FDRs, loans.
     */
    public static function portfolio(Somiti $somiti): array
    {
        $cash = self::accountBalance($somiti->id, ChartOfAccount::CODE_CASH);
        $bank = (float) BankAccount::where('somiti_id', $somiti->id)->where('is_active', true)->sum('current_balance');
        $loansOutstanding = (float) Loan::where('somiti_id', $somiti->id)->whereIn('status', ['approved', 'disbursed'])->sum('outstanding_balance');
        $investments = Investment::where('somiti_id', $somiti->id)->whereIn('status', ['approved', 'completed'])->get();
        $fdrs = Fdr::where('somiti_id', $somiti->id)->where('status', 'approved')->with('investment')->get();
        $memberSavings = self::accountBalance($somiti->id, ChartOfAccount::CODE_MEMBER_SAVINGS);
        $shareCapital = self::accountBalance($somiti->id, ChartOfAccount::CODE_SHARE_CAPITAL);

        $investedAmount = (float) $investments->sum('amount') + (float) $fdrs->sum('maturity_amount');
        $totalFund = $cash + $bank + $investedAmount + $loansOutstanding;
        $deployed = $investedAmount + $loansOutstanding;

        return [
            'currency_symbol' => $somiti->currency_symbol ?? '$',
            'total_fund' => $totalFund,
            'cash' => $cash,
            'bank' => $bank,
            'loans_outstanding' => $loansOutstanding,
            'invested' => $investedAmount,
            'member_savings' => $memberSavings,
            'share_capital' => $shareCapital,
            'deployment_rate' => $totalFund > 0 ? round($deployed / $totalFund * 100, 1) : 0,
            'investments' => $investments->map(fn ($i) => [
                'id' => $i->id, 'type' => $i->type, 'amount' => (float) $i->amount,
                'maturity_date' => $i->maturity_date?->toDateString(), 'status' => $i->status,
            ])->values(),
            'fdrs' => $fdrs->map(fn ($f) => [
                'id' => $f->id, 'bank_name' => $f->bank_name, 'interest_rate' => (float) $f->interest_rate,
                'tenure_months' => $f->tenure_months, 'maturity_amount' => (float) $f->maturity_amount,
            ])->values(),
        ];
    }

    /**
     * One member's full financial profile.
     */
    public static function memberProfile(Somiti $somiti, int $userId): array
    {
        $member = \App\Models\SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $userId)->with('user')->firstOrFail();

        $totalSavings = (float) \App\Models\Deposit::where('somiti_id', $somiti->id)->where('user_id', $userId)->where('status', 'approved')->sum('amount');
        $shares = UserShare::where('somiti_id', $somiti->id)->where('user_id', $userId)->where('status', 'approved')->get();
        $shareCount = (int) $shares->sum('share_count');
        $shareValue = (float) $shares->sum(function ($s) {
            $price = \App\Models\Share::where('somiti_id', $s->somiti_id)
                ->where('financial_year_id', $s->financial_year_id)
                ->value('share_price');

            return $s->share_count * (float) ($price ?? 0);
        });
        $loans = Loan::where('somiti_id', $somiti->id)->where('user_id', $userId)->whereIn('status', ['approved', 'disbursed'])->get();
        $loanOutstanding = (float) $loans->sum('outstanding_balance');
        $dividends = (float) DividendAllocation::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereHas('declaration', fn ($q) => $q->where('somiti_id', $somiti->id))
            ->sum('total_dividend');
        $dues = DuesService::memberDues($somiti, $userId);

        $transactions = collect()
            ->concat(
                \App\Models\Deposit::where('somiti_id', $somiti->id)->where('user_id', $userId)
                    ->where('status', 'approved')->latest()->limit(20)->get()
                    ->map(fn ($d) => [
                        'type' => 'deposit', 'label' => "Deposit {$d->month}", 'amount' => (float) $d->amount,
                        'date' => ($d->approved_at ?? $d->created_at)?->toDateString(),
                    ])
            )
            ->concat(
                Loan::where('somiti_id', $somiti->id)->where('user_id', $userId)->latest()->limit(20)->get()
                    ->map(fn ($l) => [
                        'type' => 'loan', 'label' => 'Loan '.($l->purpose ?: "#{$l->id}"), 'amount' => (float) $l->amount,
                        'date' => $l->created_at->toDateString(),
                    ])
            )
            ->concat(
                \App\Models\LoanRepayment::where('somiti_id', $somiti->id)->where('user_id', $userId)
                    ->where('status', 'approved')->latest()->limit(20)->get()
                    ->map(fn ($r) => [
                        'type' => 'repayment', 'label' => 'Loan repayment', 'amount' => (float) $r->amount,
                        'date' => $r->created_at->toDateString(),
                    ])
            )
            ->sortByDesc('date')
            ->take(30)
            ->values();

        return [
            'member' => $member->user,
            'role' => $member->role,
            'joined_at' => $member->joined_at?->toDateString(),
            'total_savings' => $totalSavings,
            'share_count' => $shareCount,
            'share_value' => $shareValue,
            'loan_outstanding' => $loanOutstanding,
            'dividends_received' => $dividends,
            'dues' => [
                'total_expected' => $dues['total_expected'],
                'total_paid' => $dues['total_paid'],
                'due_count' => $dues['due_count'],
                'overdue_count' => $dues['overdue_count'],
            ],
            'transactions' => $transactions,
            'net_worth' => $totalSavings + $shareValue + $dividends - $loanOutstanding,
        ];
    }
}
