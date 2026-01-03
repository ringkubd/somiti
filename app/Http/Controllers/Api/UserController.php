<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function show(User $user)
    {
        if (! Auth::user()->can('view', $user)) abort(403);

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        if (! Auth::user()->can('update', $user)) abort(403);

        $attrs = $request->only(['name', 'phone', 'email']);
        $user->update($attrs);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        if (! Auth::user()->can('delete', $user)) abort(403);

        $user->delete();

        return response()->json(['deleted' => true]);
    }

    // Assign a permission to a user (only global admins or somiti owner/manager in same somiti can assign somiti-scoped permission)
    public function assignPermission(Request $request, User $user)
    {
        $request->validate(['permission' => 'required|string']);

        $acting = Auth::user();
        $perm = $request->input('permission');

        // global admin
        if ($acting->hasPermission('manage_all')) {
            $user->givePermissionTo($perm);
            return response()->json(['assigned' => true]);
        }

        // allow owner/manager to assign somiti-scoped permission only if they share a somiti with the target
        $sharedSomiti = \DB::table('somiti_members')->where('user_id', $user->id)->pluck('somiti_id');
        foreach ($sharedSomiti as $sid) {
            if ($acting->isOwnerOfSomiti($sid) || $acting->isManagerOfSomiti($sid)) {
                if ($perm === 'manage_somiti_members') {
                    $user->givePermissionTo($perm);
                    return response()->json(['assigned' => true]);
                }
            }
        }

        abort(403);
    }

    public function revokePermission(Request $request, User $user)
    {
        $request->validate(['permission' => 'required|string']);

        $acting = Auth::user();
        $perm = $request->input('permission');

        if ($acting->hasPermission('manage_all')) {
            $user->revokePermission($perm);
            return response()->json(['revoked' => true]);
        }

        $sharedSomiti = \DB::table('somiti_members')->where('user_id', $user->id)->pluck('somiti_id');
        foreach ($sharedSomiti as $sid) {
            if ($acting->isOwnerOfSomiti($sid) || $acting->isManagerOfSomiti($sid)) {
                if ($perm === 'manage_somiti_members') {
                    $user->revokePermission($perm);
                    return response()->json(['revoked' => true]);
                }
            }
        }

        abort(403);
    }
}
