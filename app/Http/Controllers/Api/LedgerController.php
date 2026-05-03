<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\Ledger;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $somitiId) {
            abort(400, 'somiti_id is required');
        }

        if (! $user->isMemberOfSomiti($somitiId) && ! $user->isManagerOfSomiti($somitiId) && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        $entries = JournalEntry::where('somiti_id', $somitiId)
            ->with('lines.chartOfAccount')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($entries);
    }

    public function show(JournalEntry $ledger)
    {
        if (! Auth::user()->can('viewLedger', [Ledger::class, $ledger->somiti_id])) {
            abort(403);
        }

        return response()->json($ledger->load('lines.chartOfAccount', 'reference'));
    }

    /**
     * Get trial balance for a somiti.
     */
    public function trialBalance(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');
        $asOf = $request->query('as_of');

        if (! $somitiId) {
            return response()->json(['message' => 'somiti_id is required'], 400);
        }

        if (! $user->isMemberOfSomiti($somitiId) && ! $user->isManagerOfSomiti($somitiId) && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        $trialBalance = AccountingService::getTrialBalance($somitiId, $asOf);

        $totalDebit = array_sum(array_column($trialBalance, 'debit'));
        $totalCredit = array_sum(array_column($trialBalance, 'credit'));

        return response()->json([
            'accounts' => $trialBalance,
            'summary' => [
                'total_debit' => round($totalDebit, 2),
                'total_credit' => round($totalCredit, 2),
                'is_balanced' => abs($totalDebit - $totalCredit) < 0.005,
            ],
        ]);
    }

    /**
     * Verify all journal entries are balanced for a somiti.
     */
    public function verifyBalancesAction(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $somitiId) {
            return response()->json(['message' => 'somiti_id is required'], 400);
        }

        if (! $user->isMemberOfSomiti($somitiId) && ! $user->isManagerOfSomiti($somitiId) && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        $result = AccountingService::verifyBalances($somitiId);

        return response()->json($result);
    }

    /**
     * Get financial summary for a somiti (net account balances).
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $somitiId) {
            return response()->json(['message' => 'somiti_id is required'], 400);
        }

        if (! $user->isMemberOfSomiti($somitiId) && ! $user->isManagerOfSomiti($somitiId) && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        return response()->json([
            'cash' => AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_CASH, $somitiId),
            'member_savings' => AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_MEMBER_SAVINGS, $somitiId),
            'loans_receivable' => AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_LOANS_RECEIVABLE, $somitiId),
            'share_capital' => AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_SHARE_CAPITAL, $somitiId),
        ]);
    }
}
