<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Deposit;
use App\Models\JournalEntryLine;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\User;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function trialBalance(Somiti $somiti)
    {
        $trial = AccountingService::getTrialBalance($somiti->id);
        $verify = AccountingService::verifyBalances($somiti->id);

        $totalDebit = round(array_sum(array_column($trial, 'debit')), 2);
        $totalCredit = round(array_sum(array_column($trial, 'credit')), 2);

        return Inertia::render('Reports/TrialBalance', [
            'somiti' => $somiti,
            'accounts' => $trial,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'is_balanced' => $verify['balanced'],
            'unbalanced' => $verify['unbalanced'],
        ]);
    }

    public function summary(Somiti $somiti)
    {
        $cashBalance = AccountingService::getAccountBalance(
            ChartOfAccount::CODE_CASH, $somiti->id
        );
        $memberSavings = AccountingService::getAccountBalance(
            ChartOfAccount::CODE_MEMBER_SAVINGS, $somiti->id
        );
        $loansReceivable = AccountingService::getAccountBalance(
            ChartOfAccount::CODE_LOANS_RECEIVABLE, $somiti->id
        );
        $shareCapital = AccountingService::getAccountBalance(
            ChartOfAccount::CODE_SHARE_CAPITAL, $somiti->id
        );

        return Inertia::render('Reports/Summary', [
            'somiti' => $somiti,
            'accounts' => [
                ['code' => 'CASH', 'name' => 'Cash', 'type' => 'asset', 'balance' => $cashBalance],
                ['code' => 'MEMBER_SAVINGS', 'name' => 'Member Savings', 'type' => 'liability', 'balance' => $memberSavings],
                ['code' => 'LOANS_RECEIVABLE', 'name' => 'Loans Receivable', 'type' => 'asset', 'balance' => $loansReceivable],
                ['code' => 'SHARE_CAPITAL', 'name' => 'Share Capital', 'type' => 'equity', 'balance' => $shareCapital],
            ],
        ]);
    }

    /**
     * Per-member financial statement.
     */
    public function memberStatement(Request $request, Somiti $somiti)
    {
        $user = auth()->user();
        $canViewAll = $user->isManagerOfSomiti($somiti->id) || $user->isOwnerOfSomiti($somiti->id);

        if (! ($canViewAll || $user->isMemberOfSomiti($somiti->id))) {
            abort(403);
        }

        $userId = $canViewAll ? (int) $request->query('user_id', $user->id) : $user->id;

        if (! $somiti->members()->where('user_id', $userId)->where('is_active', true)->exists()) {
            abort(404);
        }

        $member = User::findOrFail($userId);
        $members = $canViewAll
            ? $somiti->members()->with('user:id,name,email,phone')->where('is_active', true)->get()
            : collect();

        $savingsBalance = AccountingService::getMemberBalance($userId, ChartOfAccount::CODE_MEMBER_SAVINGS, $somiti->id);
        $shareCapital = AccountingService::getMemberBalance($userId, ChartOfAccount::CODE_SHARE_CAPITAL, $somiti->id);
        $outstandingLoans = (float) Loan::where('somiti_id', $somiti->id)
            ->where('user_id', $userId)
            ->whereIn('status', ['approved', 'disbursed'])
            ->sum('outstanding_balance');

        $deposits = Deposit::with('financialYear')
            ->where('somiti_id', $somiti->id)
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->latest()
            ->get(['id', 'amount', 'type', 'status', 'created_at']);

        $loans = Loan::with('financialYear')
            ->where('somiti_id', $somiti->id)
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'amount', 'interest_rate', 'interest_type', 'duration_months', 'outstanding_balance', 'status', 'created_at']);

        $transactions = JournalEntryLine::with(['journalEntry', 'chartOfAccount'])
            ->where('member_id', $userId)
            ->whereHas('journalEntry', fn ($q) => $q->where('somiti_id', $somiti->id))
            ->latest('journal_entry_id')
            ->get(['id', 'journal_entry_id', 'chart_of_account_id', 'debit', 'credit', 'description', 'created_at']);

        return Inertia::render('Reports/MemberStatement', [
            'somiti' => $somiti,
            'member' => $member->only(['id', 'name', 'email', 'phone']),
            'members' => $members,
            'can_view_all' => $canViewAll,
            'summary' => [
                'savings_balance' => $savingsBalance,
                'share_capital' => $shareCapital,
                'outstanding_loans' => $outstandingLoans,
            ],
            'deposits' => $deposits,
            'loans' => $loans,
            'transactions' => $transactions,
        ]);
    }

    /**
     * CSV export of the summary report.
     */
    public function summaryCsv(Somiti $somiti)
    {
        if (! auth()->user()->can('view', $somiti)) {
            abort(403);
        }

        $accountCodes = [
            ChartOfAccount::CODE_CASH => 'Cash',
            ChartOfAccount::CODE_MEMBER_SAVINGS => 'Member Savings',
            ChartOfAccount::CODE_LOANS_RECEIVABLE => 'Loans Receivable',
            ChartOfAccount::CODE_SHARE_CAPITAL => 'Share Capital',
            ChartOfAccount::CODE_INVESTMENTS => 'Investments',
            ChartOfAccount::CODE_FDR_ASSET => 'FDR Assets',
            ChartOfAccount::CODE_INCOME_INTEREST => 'Interest Income',
            ChartOfAccount::CODE_INCOME_PENALTY => 'Penalty Income',
            ChartOfAccount::CODE_EXPENSE_INTEREST => 'Interest Expense',
        ];

        $rows = [['Code', 'Account', 'Balance']];
        foreach ($accountCodes as $code => $name) {
            $rows[] = [$code, $name, number_format(AccountingService::getAccountBalance($code, $somiti->id), 2)];
        }

        return $this->csvDownload('summary-'.str_slug($somiti->unique_code).'.csv', $rows);
    }

    /**
     * CSV export of a member statement.
     */
    public function memberStatementCsv(Request $request, Somiti $somiti)
    {
        $user = auth()->user();
        $canViewAll = $user->isManagerOfSomiti($somiti->id) || $user->isOwnerOfSomiti($somiti->id);

        if (! ($canViewAll || $user->isMemberOfSomiti($somiti->id))) {
            abort(403);
        }

        $userId = $canViewAll ? (int) $request->query('user_id', $user->id) : $user->id;
        $member = User::findOrFail($userId);

        $rows = [
            ['Somiti', $somiti->name],
            ['Member', $member->name],
            ['Email', $member->email ?? ''],
            ['Phone', $member->phone ?? ''],
            [''],
            ['Member Statement'],
            ['Savings Balance', number_format(AccountingService::getMemberBalance($userId, ChartOfAccount::CODE_MEMBER_SAVINGS, $somiti->id), 2)],
            ['Share Capital', number_format(AccountingService::getMemberBalance($userId, ChartOfAccount::CODE_SHARE_CAPITAL, $somiti->id), 2)],
            ['Outstanding Loans', number_format((float) Loan::where('somiti_id', $somiti->id)->where('user_id', $userId)->whereIn('status', ['approved', 'disbursed'])->sum('outstanding_balance'), 2)],
            [''],
            ['Approved Deposits'],
            ['Date', 'Type', 'Amount'],
        ];

        Deposit::where('somiti_id', $somiti->id)->where('user_id', $userId)->where('status', 'approved')->latest()->each(function (Deposit $deposit) use (&$rows) {
            $rows[] = [$deposit->created_at->toDateString(), $deposit->type, number_format((float) $deposit->amount, 2)];
        });

        $rows[] = [''];
        $rows[] = ['Loans'];
        $rows[] = ['Date', 'Amount', 'Interest', 'Outstanding', 'Status'];

        Loan::where('somiti_id', $somiti->id)->where('user_id', $userId)->latest()->each(function (Loan $loan) use (&$rows) {
            $rows[] = [$loan->created_at->toDateString(), number_format((float) $loan->amount, 2), $loan->interest_rate.'%', number_format((float) $loan->outstanding_balance, 2), $loan->status];
        });

        return $this->csvDownload('member-statement-'.$somiti->unique_code.'-'.$member->id.'.csv', $rows);
    }

    private function csvDownload(string $filename, array $rows)
    {
        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
