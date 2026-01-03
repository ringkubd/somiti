<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LedgerController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $user->can('index', Ledger::class, $somitiId)) {
            // fallback: ensure user belongs to somiti
            if (! $user->isMemberOfSomiti($somitiId) && ! $user->isManagerOfSomiti($somitiId) && ! $user->isOwnerOfSomiti($somitiId)) {
                abort(403);
            }
        }

        $ledgers = Ledger::where('somiti_id', $somitiId)->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($ledgers);
    }

    public function show(Ledger $ledger)
    {
        if (! Auth::user()->can('view', $ledger)) abort(403);

        return response()->json($ledger);
    }
}
