<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiMembershipController extends Controller
{
    public function store(Request $request, Somiti $somiti)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) abort(403);

        $request->validate(['user_id' => 'required|exists:users,id', 'role' => 'nullable|string']);

        $somiti->addMember(User::findOrFail($request->input('user_id')), $request->input('role', 'member'));

        return redirect()->route('somitis.show', $somiti);
    }

    public function destroy(Somiti $somiti, User $user)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) abort(403);

        $somiti->removeMember($user);

        return redirect()->route('somitis.show', $somiti);
    }
}
