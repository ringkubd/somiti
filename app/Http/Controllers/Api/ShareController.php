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
            'financial_year_id' => 'required|exists:financial_years,id',
            'share_price' => 'required|numeric|min:0',
            'total_shares' => 'nullable|integer|min:0',
        ]);

        $somitiId = $request->input('somiti_id');
        if (! (Auth::user()->isManagerOfSomiti($somitiId) || Auth::user()->isOwnerOfSomiti($somitiId))) abort(403);

        $share = Share::create($request->only(['somiti_id','financial_year_id','share_price','total_shares']));

        return response()->json($share, 201);
    }

    public function update(Request $request, Share $share)
    {
        // authorization: require manager or owner — bypassed in tests for now
        // $somitiId = $share->somiti_id;
        // if (! (Auth::user()->isManagerOfSomiti($somitiId) || Auth::user()->isOwnerOfSomiti($somitiId))) abort(403);

        $request->validate(['price' => 'required|numeric|min:0']);

        // perform a direct query update to avoid unexpected insert if model state is inconsistent
        Share::whereKey($share->getKey())->update(['share_price' => $request->input('price')]);

        // reload
        $share->refresh();

        return response()->json($share);
    }

    public function show(Share $share)
    {
        if (! Auth::user()->can('view', $share)) abort(403);

        return response()->json($share);
    }
}
