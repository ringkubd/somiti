<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\SomitiManager;
use App\Services\ManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ManagerController extends Controller
{
    public function index(Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        return response()->json(
            SomitiManager::where('somiti_id', $somiti->id)
                ->with('user')
                ->orderByDesc('from_date')
                ->get()
        );
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

        if ($somiti->created_by_user_id === (int) $validated['user_id']) {
            throw ValidationException::withMessages(['user_id' => 'The owner is already the manager.']);
        }

        $manager = ManagerService::appoint(
            $somiti,
            (int) $validated['user_id'],
            $validated['from_date'],
            $validated['to_date'] ?? null,
            $validated['note'] ?? null
        );

        return response()->json($manager, 201);
    }

    public function destroy(Somiti $somiti, SomitiManager $manager)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        if ($manager->somiti_id !== $somiti->id) {
            abort(404);
        }

        $manager = ManagerService::end($manager);

        return response()->json($manager);
    }
}
