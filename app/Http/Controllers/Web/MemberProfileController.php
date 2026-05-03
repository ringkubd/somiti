<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\FinancialYear;
use App\Models\Loan;
use App\Models\ShareTransfer;
use App\Models\User;
use App\Models\UserShare;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MemberProfileController extends Controller
{
    public function show(?User $user = null)
    {
        // If no user is passed, show the logged-in user's profile
        $user = $user ?: auth()->user();

        // Check if the auth user has permission to see this profile
        // (Must be the user themselves or a Somiti Admin they belong to)
        if ($user->id !== auth()->id()) {
            // Check if auth user is admin of any somiti this user belongs to
            $isAdmin = \App\Models\Somiti::where('created_by_user_id', auth()->id())
                ->whereHas('members', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->exists();

            if (! $isAdmin && auth()->user()->role !== 'super_admin') {
                abort(403);
            }
        }

        // 1. Share Position & History
        $shares = UserShare::with('somiti')
            ->where('user_id', $user->id)
            ->get();

        // 2. Deposit History
        $deposits = Deposit::with(['somiti', 'financialYear'])
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->latest()
            ->get();

        // 3. Active Loans
        $loans = Loan::with('somiti')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // 4. Share Transfer History (Both ways)
        $transfers = ShareTransfer::with(['somiti', 'fromUser', 'toUser'])
            ->where(function ($q) use ($user) {
                $q->where('from_user_id', $user->id)
                    ->orWhere('to_user_id', $user->id);
            })
            ->latest()
            ->get();

        // 5. Financial Year Pricing History (Relevant to the somitis they are in)
        $somitiIds = $user->somitis()->pluck('somitis.id');
        $financialYears = FinancialYear::with('somiti')
            ->whereIn('somiti_id', $somitiIds)
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Profile/Show', [
            'member' => $user,
            'shares' => $shares,
            'deposits' => $deposits,
            'loans' => $loans,
            'transfers' => $transfers,
            'financialYears' => $financialYears,
        ]);
    }
}
