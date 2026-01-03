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
}
