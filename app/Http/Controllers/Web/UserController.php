<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function show(User $user)
    {
        if (! Auth::user()->can('view', $user)) abort(403);

        return view('users.show', compact('user'));
    }

    public function edit(User $user)
    {
        if (! Auth::user()->can('update', $user)) abort(403);

        return view('users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        if (! Auth::user()->can('update', $user)) abort(403);

        $user->update($request->only(['name', 'email', 'phone']));

        return redirect()->route('users.show', $user);
    }

    public function destroy(User $user)
    {
        if (! Auth::user()->can('delete', $user)) abort(403);

        $user->delete();

        return redirect()->route('home');
    }
}
