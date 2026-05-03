<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SomitiSettingController extends Controller
{
    public function edit(Somiti $somiti)
    {
        $this->authorize('update', $somiti);

        $activeFy = $somiti->activeFinancialYear();

        return Inertia::render('Somitis/Settings', [
            'somiti' => $somiti->load('financialYears'),
            'activeFinancialYear' => $activeFy,
        ]);
    }

    public function update(Request $request, Somiti $somiti)
    {
        $this->authorize('update', $somiti);

        $validated = $request->validate([
            'currency' => 'required|string|max:10',
            'currency_symbol' => 'required|string|max:5',
            'logo_url' => 'nullable|url',
            'receipt_header' => 'nullable|string|max:255',
            'receipt_footer' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'default_interest_rate' => 'nullable|numeric|min:0|max:100',
            'total_shares' => 'nullable|integer|min:0',
            'min_share_per_member' => 'nullable|integer|min:1',
            'max_share_per_member' => 'nullable|integer|min:1',
            'loan_penalty_rate' => 'nullable|numeric|min:0|max:100',
            'loan_grace_days' => 'nullable|integer|min:0',
            'share_value' => 'nullable|numeric|min:0',
        ]);

        $somiti->update($validated);

        // Update active financial year share_value if provided
        if ($request->filled('share_value')) {
            $activeFy = $somiti->activeFinancialYear();
            if ($activeFy) {
                $activeFy->update(['share_value' => $request->share_value]);
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
