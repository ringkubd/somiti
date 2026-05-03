<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Services\AccountingService;
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
            \App\Models\ChartOfAccount::CODE_CASH, $somiti->id
        );
        $memberSavings = AccountingService::getAccountBalance(
            \App\Models\ChartOfAccount::CODE_MEMBER_SAVINGS, $somiti->id
        );
        $loansReceivable = AccountingService::getAccountBalance(
            \App\Models\ChartOfAccount::CODE_LOANS_RECEIVABLE, $somiti->id
        );
        $shareCapital = AccountingService::getAccountBalance(
            \App\Models\ChartOfAccount::CODE_SHARE_CAPITAL, $somiti->id
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
}
