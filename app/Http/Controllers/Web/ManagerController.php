<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\SomitiManager;
use App\Models\SomitiMember;
use App\Services\ManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ManagerController extends Controller
{
    public function index(Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        return Inertia::render('Somiti/Managers', [
            'somiti' => $somiti->only(['id', 'name']),
            'managers' => SomitiManager::where('somiti_id', $somiti->id)->with('user')->orderByDesc('from_date')->get(),
            'members' => SomitiMember::where('somiti_id', $somiti->id)->where('is_active', true)->with('user')->orderBy('joined_at')->get(),
        ]);
    }

    public function store(Request $request, Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'from_date' => 'required|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'note' => 'nullable|string|max:500',
        ]);

        ManagerService::appoint(
            $somiti,
            (int) $validated['user_id'],
            $validated['from_date'],
            $validated['to_date'] ?? null,
            $validated['note'] ?? null
        );

        return redirect()->back()->with('success', 'Manager appointed.');
    }

    public function destroy(Somiti $somiti, SomitiManager $manager)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        if ($manager->somiti_id !== $somiti->id) {
            abort(404);
        }

        ManagerService::end($manager);

        return redirect()->back()->with('success', 'Manager tenure ended.');
    }
}
