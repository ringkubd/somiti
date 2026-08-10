<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ManagerElection;
use App\Models\Somiti;
use App\Services\ManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ManagerElectionController extends Controller
{
    public function index(Somiti $somiti)
    {
        if (! Auth::user()->isMemberOfSomiti($somiti->id)
            && ! Auth::user()->isManagerOfSomiti($somiti->id)
            && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        return response()->json(
            ManagerElection::where('somiti_id', $somiti->id)
                ->with('candidate', 'approvals.user')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /**
     * Start an election for a new manager — every member votes, majority decides.
     */
    public function store(Request $request, Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'candidate_user_id' => 'required|exists:users,id',
            'from_date' => 'required|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'note' => 'nullable|string|max:500',
        ]);

        $election = ManagerElection::create([
            'somiti_id' => $somiti->id,
            'candidate_user_id' => $validated['candidate_user_id'],
            'from_date' => $validated['from_date'],
            'to_date' => $validated['to_date'] ?? null,
            'note' => $validated['note'] ?? null,
            'status' => 'pending',
        ]);

        $election->requestApproval($somiti->created_by_user_id, 'New manager election.');

        return response()->json($election->load('candidate'), 201);
    }
}
