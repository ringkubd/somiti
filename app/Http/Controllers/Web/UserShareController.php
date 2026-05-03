<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\FinancialYear;
use App\Models\Somiti;
use App\Models\UserShare;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserShareController extends Controller
{
    public function index()
    {
        $userShares = \App\Models\UserShare::with(['somiti', 'user', 'financialYear'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('UserShares/Index', [
            'userShares' => $userShares,
        ]);
    }

    public function show(\App\Models\UserShare $userShare)
    {
        // check access
        if (! $userShare->somiti->users()->where('users.id', auth()->id())->exists() &&
            $userShare->somiti->created_by_user_id !== auth()->id()) {
            abort(403);
        }

        return \Inertia\Inertia::render('UserShares/Show', [
            'userShare' => $userShare->load(['somiti', 'user', 'financialYear']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $somitiId = $request->query('somiti_id');

        $somitis = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get(['id', 'name', 'total_shares', 'min_share_per_member', 'max_share_per_member']);

        $members = collect();
        $financialYears = collect();
        $shareSummary = null;

        if ($somitiId) {
            $somiti = Somiti::find($somitiId);
            if ($somiti) {
                $members = $somiti->users()->where('user_id', '!=', $user->id)
                    ->select('users.id', 'users.name')->get();
                $financialYears = FinancialYear::where('somiti_id', $somitiId)
                    ->where('is_active', true)
                    ->get(['id', 'title']);

                $totalAssigned = (int) UserShare::where('somiti_id', $somitiId)->sum('share_count');
                $totalShares = $somiti->total_shares ?? 0;
                $shareSummary = [
                    'total_available' => $totalShares,
                    'total_assigned' => $totalAssigned,
                    'remaining' => max(0, $totalShares - $totalAssigned),
                    'min_per_member' => $somiti->min_share_per_member ?? 1,
                    'max_per_member' => $somiti->max_share_per_member ?? $totalShares,
                ];
            }
        }

        return Inertia::render('UserShares/Create', [
            'somitis' => $somitis,
            'members' => $members,
            'financialYears' => $financialYears,
            'shareSummary' => $shareSummary,
            'selectedSomitiId' => $somitiId ? (int) $somitiId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'user_id' => 'required|exists:users,id|different:'.auth()->id(),
            'share_count' => 'required|integer|min:1',
            'financial_year_id' => 'required|exists:financial_years,id',
        ]);

        $somiti = Somiti::findOrFail($validated['somiti_id']);

        // Check share availability
        $totalAssigned = (int) UserShare::where('somiti_id', $somiti->id)->sum('share_count');
        $totalShares = $somiti->total_shares ?? 0;
        $remaining = max(0, $totalShares - $totalAssigned);

        if ($remaining < $validated['share_count']) {
            return back()->withErrors([
                'share_count' => "Only {$remaining} shares available. Requested {$validated['share_count']}.",
            ]);
        }

        $share = UserShare::firstOrCreate(
            [
                'user_id' => $validated['user_id'],
                'somiti_id' => $validated['somiti_id'],
                'financial_year_id' => $validated['financial_year_id'],
            ],
            ['share_count' => 0]
        );

        $share->share_count += $validated['share_count'];
        $share->status = 'pending';
        $share->save();

        $share->requestApproval(auth()->id(), 'New share allocation.');

        return redirect()->route('user-shares.index')->with('success', 'Share allocation submitted for approval.');
    }
}
