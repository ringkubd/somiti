<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShareController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $shares = Share::where(function ($q) use ($user) {
            $q->whereHas('somiti.members', function ($q2) use ($user) { $q2->where('user_id', $user->id); })
              ->orWhereHas('somiti.managers', function ($q2) use ($user) { $q2->where('user_id', $user->id); });
        })->paginate(50);

        return response()->json($shares);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        if (! Auth::user()->can('create', [Share::class, $request->input('somiti_id')])) abort(403);

        $share = Share::create($request->only(['somiti_id','name','price']));

        return response()->json($share, 201);
    }

    public function update(Request $request, Share $share)
    {
        if (! Auth::user()->can('update', $share)) abort(403);

        $request->validate(['price' => 'required|numeric|min:0']);

        $share->price = $request->input('price');
        $share->save();

        return response()->json($share);
    }

    public function show(Share $share)
    {
        if (! Auth::user()->can('view', $share)) abort(403);

        return response()->json($share);
    }
}
