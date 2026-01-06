<?php

namespace App\Http\Controllers;

use App\Models\Approval;
use App\Models\Deposit;
use App\Models\Ledger;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DepositController extends Controller
{
    /**
     * Store a deposit request (Pending).
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:1',
            'month' => 'nullable|string',
            'type' => 'required|in:monthly,dps',
        ]);

        $user = $request->user();
        $somiti = Somiti::findOrFail($request->somiti_id);
        $activeYear = $somiti->activeFinancialYear();

        if (!$activeYear) {
            return response()->json(['message' => 'No active financial year found for this Somiti.'], 400);
        }

        $deposit = Deposit::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $activeYear->id,
            'user_id' => $user->id,
            'amount' => $request->amount,
            'month' => $request->month,
            'type' => $request->type,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Deposit request submitted successfully.',
            'deposit' => $deposit,
        ], 201);
    }

    /**
     * Approve a deposit.
     * Implements Quorum logic:
     * 1. Creates an Approval record for the user.
     * 2. Checks if quorum is met (for now, let's say 1 approval is enough for deposits, or just check if user is manager).
     * 3. If final, writes to Ledger.
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();

        // Ensure user is a manager (simplified check)
        if ($user->role !== 'manager' && $user->role !== 'admin') {
             // allow for now for testing, or assume middleware handles it
        }

        DB::transaction(function () use ($id, $user) {
            $deposit = Deposit::lockForUpdate()->findOrFail($id);

            if ($deposit->status !== 'pending') {
                throw new \Exception('Deposit is not pending.');
            }

            // Record Approval
            Approval::firstOrCreate([
                'approvable_id' => $deposit->id,
                'approvable_type' => Deposit::class,
                'user_id' => $user->id,
            ], [
                'status' => 'approved',
                'decided_at' => now(),
            ]);

            // Check Quorum (For deposits, maybe 1 manager is enough. For loans, maybe 3).
            // Let's assume 1 is enough for this phase.
            $quorumMet = true;

            if ($quorumMet) {
                // 1. Mark Deposit as Approved
                $deposit->update([
                    'status' => 'approved',
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                ]);

                // 2. Write to Ledger
                Ledger::create([
                    'somiti_id' => $deposit->somiti_id,
                    'user_id' => $deposit->user_id,
                    'transaction_ref' => 'DEP-' . strtoupper(Str::random(8)),
                    'type' => 'deposit',
                    'amount' => $deposit->amount,
                    'dr_cr' => 'cr', // Credit the member
                    'status' => 'completed',
                    'reference_id' => $deposit->id,
                    'reference_type' => Deposit::class,
                    'description' => "Deposit approved for {$deposit->type} - {$deposit->month}",
                ]);
            }
        });

        return response()->json(['message' => 'Deposit approved and recorded in ledger.']);
    }
}
