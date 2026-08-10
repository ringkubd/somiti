<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Services\ManagerService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportApiController extends Controller
{
    private function authorizeSomiti(Somiti $somiti): void
    {
        if (! Auth::user()->isMemberOfSomiti($somiti->id)
            && ! Auth::user()->isManagerOfSomiti($somiti->id)
            && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }
    }

    public function balanceSheet(Somiti $somiti)
    {
        $this->authorizeSomiti($somiti);

        return response()->json(ReportService::balanceSheet($somiti));
    }

    public function profitLoss(Somiti $somiti)
    {
        $this->authorizeSomiti($somiti);

        return response()->json(ReportService::profitLoss($somiti));
    }

    public function portfolio(Somiti $somiti)
    {
        $this->authorizeSomiti($somiti);

        return response()->json(ReportService::portfolio($somiti));
    }

    public function memberProfile(Request $request, Somiti $somiti, ?int $userId = null)
    {
        $this->authorizeSomiti($somiti);

        $isManager = ManagerService::canManage($somiti, Auth::user());
        $userId = $userId ?? Auth::id();

        if (! $isManager && $userId !== Auth::id()) {
            abort(403, 'You can only view your own profile.');
        }

        return response()->json(ReportService::memberProfile($somiti, $userId));
    }

    public function memberProfiles(Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        $members = \App\Models\SomitiMember::where('somiti_id', $somiti->id)->where('is_active', true)->with('user')->get();

        return response()->json([
            'members' => $members->map(fn ($m) => [
                'id' => $m->user_id,
                'name' => $m->user?->name,
                'phone' => $m->user?->phone,
                'role' => $m->role,
                'profile' => ReportService::memberProfile($somiti, $m->user_id),
            ])->values(),
        ]);
    }
}
