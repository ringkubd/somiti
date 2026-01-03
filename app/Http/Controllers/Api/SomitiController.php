<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // return somitis where user is member, manager, or owner
        $somitis = Somiti::where(function ($q) use ($user) {
            $q->where('created_by_user_id', $user->id)
              ->orWhereHas('members', function ($q2) use ($user) { $q2->where('user_id', $user->id); })
              ->orWhereHas('managers', function ($q2) use ($user) { $q2->where('user_id', $user->id); });
        })->paginate(20);

        return response()->json($somitis);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $somiti = Somiti::create(['name' => $request->input('name'), 'created_by_user_id' => Auth::id()]);

        return response()->json($somiti, 201);
    }

    public function show(Somiti $somiti)
    {
        if (! Auth::user()->can('view', $somiti)) abort(403);

        return response()->json($somiti->load('members','managers'));
    }

    public function update(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->can('update', $somiti)) abort(403);

        $somiti->update($request->only(['name','address','description']));

        return response()->json($somiti);
    }
}
