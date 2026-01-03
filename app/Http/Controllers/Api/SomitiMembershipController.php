<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\User;
use App\Models\SomitiMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiMembershipController extends Controller
{
    public function store(Request $request, Somiti $somiti)
    {
        // only manager or owner can add members
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) abort(403);

        $request->validate(['user_id' => 'required|exists:users,id', 'role' => 'nullable|string']);

        $userId = $request->input('user_id');
        $role = $request->input('role', 'member');

        $member = SomitiMember::updateOrCreate(
            ['somiti_id' => $somiti->id, 'user_id' => $userId],
            ['role' => $role, 'is_active' => true, 'joined_at' => now()]
        );

        return response()->json($member, 201);
    }

    public function update(Request $request, Somiti $somiti, User $user)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) abort(403);

        $request->validate(['role' => 'required|string', 'is_active' => 'nullable|boolean']);

        $member = SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $user->id)->firstOrFail();

        $member->role = $request->input('role');
        if ($request->has('is_active')) $member->is_active = (bool) $request->input('is_active');
        $member->save();

        return response()->json($member);
    }

    public function destroy(Somiti $somiti, User $user)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) abort(403);

        $member = SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $user->id)->firstOrFail();

        $member->delete();

        return response()->json(['deleted' => true]);
    }
}
