<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BankAccountController extends Controller
{
    public function index()
    {
        $accounts = BankAccount::with('somiti')
            ->whereHas('somiti', fn($q) => $q
                ->where('created_by_user_id', Auth::id())
                ->orWhereHas('members', fn($q2) => $q2->where('user_id', Auth::id())))
            ->latest()
            ->paginate(20);

        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'bank_name' => 'required|string|max:150',
            'branch_name' => 'nullable|string|max:150',
            'account_number' => 'required|string|max:100',
            'account_name' => 'nullable|string|max:200',
            'account_type' => 'required|string|in:savings,current,fd,loan',
            'opening_balance' => 'nullable|numeric|min:0',
        ]);

        if (! (Auth::user()->isManagerOfSomiti($validated['somiti_id']) || Auth::user()->isOwnerOfSomiti($validated['somiti_id']))) {
            abort(403);
        }

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;

        $account = BankAccount::create($validated);

        return response()->json($account, 201);
    }

    public function show(BankAccount $bankAccount)
    {
        if (! Auth::user()->isMemberOfSomiti($bankAccount->somiti_id)) {
            abort(403);
        }

        return response()->json($bankAccount->load('somiti'));
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        if (! Auth::user()->isOwnerOfSomiti($bankAccount->somiti_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'bank_name' => 'string|max:150',
            'branch_name' => 'nullable|string|max:150',
            'account_number' => 'string|max:100',
            'account_type' => 'string|in:savings,current,fd,loan',
        ]);

        $bankAccount->update($validated);

        return response()->json($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        if (! Auth::user()->isOwnerOfSomiti($bankAccount->somiti_id)) {
            abort(403);
        }

        $bankAccount->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
