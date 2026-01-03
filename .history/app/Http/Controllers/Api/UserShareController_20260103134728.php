<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserShare;
use App\Models\Approval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserShareController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $shares = UserShare::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereHas('somiti.managers', function ($q2) use ($user) { $q2->where('user_id', $user->id); });
        })->with('somiti', 'financialYear')->paginate(20);

        return response()->json($shares);
    }

    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'financial_year_id' => 'required|exists:financial_years,id',
            'share_count' => 'required|integer|min:1',
        ]);

        if (! Auth::user()->can('create', [UserShare::class, $request->input('somiti_id')])) abort(403);

        $share = UserShare::create(array_merge($request->only(['somiti_id','financial_year_id','share_count']), ['user_id' => Auth::id()]));

        return response()->json($share, 201);
    }

    public function show(UserShare $share)
    {
        if (! Auth::user()->can('view', $share)) abort(403);

        return response()->json($share->load('somiti', 'financialYear'));
    }

    public function update(Request $request, UserShare $share)
    {
        if (! Auth::user()->can('update', $share)) abort(403);

        $share->update($request->only(['share_count']));

        return response()->json($share);
    }

    public function destroy(UserShare $share)
    {
        if (! Auth::user()->can('delete', $share)) abort(403);

        $share->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function approve(Request $request, UserShare $share)
    {
        if (! Auth::user()->can('approve', $share)) abort(403);

        if (isset($share->status) && $share->status === 'approved') {
            return response()->json(['message' => 'Already approved'], 422);
        }

        $share->status = 'approved';
        $share->approved_by = Auth::id();
        $share->approved_at = now();
        $share->save();

        Approval::create([
            'approvable_id' => $share->id,
            'approvable_type' => UserShare::class,
            'user_id' => Auth::id(),
            'status' => 'approved',
        ]);

        return response()->json($share);
    }
}
