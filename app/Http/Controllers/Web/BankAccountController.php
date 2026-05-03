<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index()
    {
        $accounts = BankAccount::with('somiti')
            ->whereHas('somiti', function ($q) {
                $q->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', fn($q2) => $q2->where('user_id', auth()->id()));
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('BankAccounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create()
    {
        $somitis = Somiti::where('created_by_user_id', auth()->id())
            ->orWhereHas('members', fn($q) => $q->where('user_id', auth()->id()))
            ->get(['id', 'name']);

        return Inertia::render('BankAccounts/Create', [
            'somitis' => $somitis,
        ]);
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

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;

        BankAccount::create($validated);

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account added.');
    }

    public function show(BankAccount $bankAccount)
    {
        if (! auth()->user()->isMemberOfSomiti($bankAccount->somiti_id)
            && ! auth()->user()->isManagerOfSomiti($bankAccount->somiti_id)
            && ! auth()->user()->isOwnerOfSomiti($bankAccount->somiti_id)) {
            abort(403);
        }

        return Inertia::render('BankAccounts/Show', [
            'account' => $bankAccount->load('somiti'),
        ]);
    }

    public function destroy(BankAccount $bankAccount)
    {
        if (! auth()->user()->isOwnerOfSomiti($bankAccount->somiti_id)) {
            abort(403);
        }

        $bankAccount->delete();

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account removed.');
    }
}
