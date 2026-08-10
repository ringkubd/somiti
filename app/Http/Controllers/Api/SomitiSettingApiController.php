<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SomitiSettingApiController extends Controller
{
    public function update(Request $request, Somiti $somiti)
    {
        if (! Auth::user()->isManagerOfSomiti($somiti->id) && ! Auth::user()->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'currency' => 'nullable|string|size:3',
            'currency_symbol' => 'nullable|string|max:5',
            'logo_url' => 'nullable|url',
            'receipt_header' => 'nullable|string|max:255',
            'receipt_footer' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'default_interest_rate' => 'nullable|numeric|min:0|max:100',
            'total_shares' => 'nullable|integer|min:0',
            'min_share_per_member' => 'nullable|integer|min:1',
            'max_share_per_member' => 'nullable|integer|min:1',
            'monthly_deposit_amount' => 'nullable|numeric|min:0',
            'due_day' => 'nullable|integer|min:1|max:31',
            'loan_penalty_rate' => 'nullable|numeric|min:0|max:100',
            'loan_grace_days' => 'nullable|integer|min:0',
        ]);

        if (isset($validated['currency']) && $validated['currency'] && ! \App\Services\CurrencyService::isValid($validated['currency'])) {
            throw \Illuminate\Validation\ValidationException::withMessages(['currency' => 'Unsupported currency code.']);
        }

        $somiti->update($validated);

        return response()->json($somiti);
    }
}
