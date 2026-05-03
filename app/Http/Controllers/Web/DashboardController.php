<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Services\AccountingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $allSomitis = Somiti::where('created_by_user_id', $userId)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $userId))
            ->get();

        $somitiId = request('somiti_id');
        $somiti = null;

        if ($somitiId) {
            $somiti = $allSomitis->firstWhere('id', (int) $somitiId);
        }

        if (! $somiti && $allSomitis->isNotEmpty()) {
            $somiti = $allSomitis->first();
        }

        if (! $somiti) {
            return Inertia::render('dashboard', [
                'somitis' => [],
                'selected_somiti' => null,
                'stats' => ['total_members' => 0, 'total_savings' => 0, 'total_loans' => 0, 'total_shares' => 0, 'net_fund' => 0],
                'recent_activity' => [],
                'advertisements' => [],
            ]);
        }

        $isAdmin = auth()->user()->isSuperAdmin() || ($somiti && $somiti->created_by_user_id === auth()->id());
        $isManager = $somiti && $somiti->managers()->where('user_id', auth()->id())->exists();

        session([
            'selected_somiti_id' => $somiti?->id,
            'is_somiti_admin' => $isAdmin || $isManager,
        ]);

        $stats = [
            'total_members' => SomitiMember::where('somiti_id', $somiti->id)->where('is_active', true)->count(),
            'total_savings' => (float) Deposit::where('somiti_id', $somiti->id)->where('status', 'approved')->sum('amount'),
            'total_loans' => (float) Loan::where('somiti_id', $somiti->id)->whereIn('status', ['approved', 'disbursed'])->sum('outstanding_balance'),
            'total_shares' => (float) AccountingService::getAccountBalance(
                \App\Models\ChartOfAccount::CODE_SHARE_CAPITAL,
                $somiti->id
            ),
            'net_fund' => (float) AccountingService::getAccountBalance(
                \App\Models\ChartOfAccount::CODE_CASH,
                $somiti->id
            ),
        ];

        $trend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $amount = Deposit::where('somiti_id', $somiti->id)
                ->where('status', 'approved')
                ->whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->sum('amount');
            $trend[] = ['month' => $month->format('M'), 'amount' => (float) $amount];
        }
        $stats['savings_trend'] = $trend;

        $recentDeposits = Deposit::with('user')->where('somiti_id', $somiti->id)->latest()->limit(5)->get()
            ->map(fn ($d) => [
                'type' => 'deposit',
                'description' => $d->user->name.' deposited',
                'amount' => number_format($d->amount, 2),
                'time' => $d->created_at->diffForHumans(),
                'status' => $d->status,
            ]);

        $recentLoans = Loan::with('user')->where('somiti_id', $somiti->id)->latest()->limit(5)->get()
            ->map(fn ($l) => [
                'type' => 'loan',
                'description' => $l->user->name.' loan',
                'amount' => number_format($l->amount, 2),
                'time' => $l->created_at->diffForHumans(),
                'status' => $l->status,
            ]);

        $recentActivity = $recentDeposits->concat($recentLoans)->sortByDesc('time')->take(5)->values();

        $ads = \App\Models\Advertisement::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->where('position', 'dashboard_top')
            ->latest()
            ->limit(1)
            ->get();

        return Inertia::render('dashboard', [
            'somitis' => $allSomitis->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'unique_code' => $s->unique_code,
                'currency_symbol' => $s->currency_symbol ?? '$',
                'currency' => $s->currency ?? 'USD',
            ]),
            'selected_somiti' => $somiti ? [
                'id' => $somiti->id,
                'name' => $somiti->name,
                'unique_code' => $somiti->unique_code,
                'currency_symbol' => $somiti->currency_symbol ?? '$',
                'currency' => $somiti->currency ?? 'USD',
                'total_members' => $stats['total_members'],
                'members' => $somiti->members()->with('user')->get(),
                'managers' => $somiti->managers()->with('user')->get(),
            ] : null,
            'is_admin' => $isAdmin || $isManager,
            'stats' => $stats,
            'recent_activity' => $recentActivity,
            'advertisements' => $ads,
        ]);
    }
}
