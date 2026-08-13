<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $somitiId = $request->query('somiti_id');

        $somitis = Somiti::where('created_by_user_id', $userId)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $userId))
            ->get();

        if ($somitiId) {
            $somiti = $somitis->firstWhere('id', (int) $somitiId);
        } else {
            $somiti = $somitis->first();
        }

        if (! $somiti) {
            return response()->json(['somitis' => [], 'selected_somiti' => null, 'stats' => []]);
        }

        $stats = [
            'total_members' => SomitiMember::where('somiti_id', $somiti->id)->where('is_active', true)->count(),
            'total_savings' => (float) Deposit::where('somiti_id', $somiti->id)->where('status', 'approved')->sum('amount'),
            'total_loans' => (float) Loan::where('somiti_id', $somiti->id)->whereIn('status', ['approved', 'disbursed'])->sum('outstanding_balance'),
            'net_fund' => (float) AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_CASH, $somiti->id),
            'share_capital' => (float) AccountingService::getAccountBalance(\App\Models\ChartOfAccount::CODE_SHARE_CAPITAL, $somiti->id),
        ];

        // Fund allocation snapshot for the financial dashboard
        $portfolio = \App\Services\ReportService::portfolio($somiti);
        $dues = \App\Services\DuesService::somitiDues($somiti);
        $currentManager = \App\Models\SomitiManager::where('somiti_id', $somiti->id)
            ->where(fn ($q) => $q->whereNull('to_date')->orWhere('to_date', '>=', now()->toDateString()))
            ->with('user')
            ->latest('from_date')
            ->first();

        return response()->json([
            'somitis' => $somitis->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'unique_code' => $s->unique_code,
                'currency_symbol' => $s->currency_symbol ?? '$',
                'currency' => $s->currency ?? 'USD',
            ]),
            'selected_somiti' => [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'unique_code' => $somiti->unique_code,
                'currency_symbol' => $somiti->currency_symbol ?? '$',
                'currency' => $somiti->currency ?? 'USD',
            ],
            'stats' => $stats,
            'fund' => [
                'total_fund' => $portfolio['total_fund'],
                'cash' => $portfolio['cash'],
                'bank' => $portfolio['bank'],
                'invested' => $portfolio['invested'],
                'loans_outstanding' => $portfolio['loans_outstanding'],
                'deployment_rate' => $portfolio['deployment_rate'],
                'member_savings' => $portfolio['member_savings'],
            ],
            'dues' => [
                'due_count' => (int) collect($dues['members'] ?? [])->sum('due_count'),
                'overdue_count' => (int) collect($dues['members'] ?? [])->sum('overdue_count'),
                'expected' => $dues['totals']['expected'] ?? 0,
                'paid' => $dues['totals']['paid'] ?? 0,
            ],
            'manager' => $currentManager ? [
                'id' => $currentManager->user_id,
                'name' => $currentManager->user?->name,
                'from_date' => $currentManager->from_date?->toDateString(),
                'to_date' => $currentManager->to_date?->toDateString(),
            ] : null,
            'can_manage' => $userId === $somiti->created_by_user_id
                || \App\Models\SomitiManager::where('somiti_id', $somiti->id)->where('user_id', $userId)
                    ->where(fn ($q) => $q->whereNull('to_date')->orWhere('to_date', '>', now()->endOfDay()))
                    ->exists(),
            'recent_activity' => collect(
                Deposit::with('user')->where('somiti_id', $somiti->id)->latest()->limit(5)->get()
                    ->map(fn($d) => ['type' => 'deposit', 'description' => $d->user->name . ' deposited', 'amount' => (float) $d->amount, 'status' => $d->status])
            )->concat(
                Loan::with('user')->where('somiti_id', $somiti->id)->latest()->limit(5)->get()
                    ->map(fn($l) => ['type' => 'loan', 'description' => $l->user->name . ' loan', 'amount' => (float) $l->amount, 'status' => $l->status])
            )->sortByDesc('status')->values(),
        ]);
    }
}
