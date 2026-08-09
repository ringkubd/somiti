<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiMembershipController extends Controller
{
    public function create(Somiti $somiti)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        // Get users who are not already members of this somiti
        $existingMemberIds = $somiti->members()->pluck('user_id');
        $availableUsers = User::whereNotIn('id', $existingMemberIds)->get(['id', 'name', 'email']);

        return \Inertia\Inertia::render('Somitis/Members/Create', [
            'somiti' => $somiti,
            'availableUsers' => $availableUsers,
        ]);
    }

    public function store(Request $request, Somiti $somiti)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,manager,owner',
        ]);

        $somiti->addMember(User::findOrFail($request->input('user_id')), $request->input('role'));

        return redirect()->route('somitis.show', $somiti)->with('success', 'Member added successfully.');
    }

    public function update(Request $request, Somiti $somiti, User $user)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        $request->validate([
            'role' => 'required|in:member,manager,owner',
        ]);

        $member = $somiti->members()->where('user_id', $user->id)->where('is_active', true)->first();

        if (! $member) {
            return redirect()->route('somitis.show', $somiti)->with('error', 'Member not found.');
        }

        // Keep at least one active owner per society
        if ($member->role === 'owner' && $request->input('role') !== 'owner') {
            $activeOwners = $somiti->members()->where('role', 'owner')->where('is_active', true)->where('id', '!=', $member->id)->count();
            if ($activeOwners === 0) {
                return redirect()->route('somitis.show', $somiti)->with('error', 'At least one owner is required.');
            }
        }

        $member->role = $request->input('role');
        $member->save();

        return redirect()->route('somitis.show', $somiti)->with('success', 'Member role updated.');
    }

    public function destroy(Somiti $somiti, User $user)
    {
        if (! (Auth::user()->isManagerOfSomiti($somiti->id) || Auth::user()->isOwnerOfSomiti($somiti->id))) {
            abort(403);
        }

        $somiti->removeMember($user);

        return redirect()->route('somitis.show', $somiti);
    }
}
