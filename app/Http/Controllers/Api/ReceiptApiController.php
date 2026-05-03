<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Somiti;
use Illuminate\Support\Facades\Auth;

class ReceiptApiController extends Controller
{
    public function deposit(Somiti $somiti, Deposit $deposit)
    {
        if ($deposit->somiti_id !== $somiti->id) {
            abort(404);
        }

        if (! Auth::user()->isMemberOfSomiti($somiti->id)
            && ! Auth::user()->isManagerOfSomiti($somiti->id)
            && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        return response()->json([
            'somiti' => $somiti->only(['id', 'name', 'unique_code', 'currency', 'currency_symbol', 'logo_url', 'receipt_header', 'receipt_footer', 'phone', 'address']),
            'deposit' => $deposit->load(['user', 'financialYear', 'approver']),
        ]);
    }
}
