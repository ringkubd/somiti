<?php

namespace App\Http\Controllers;

use App\Models\Ledger;
use App\Models\Loan;
use App\Models\Somiti;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LoanController extends Controller
{
    /**
     * Request a loan.
     */
    public function store(Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'amount' => 'required|numeric|min:100',
            'purpose' => 'required|string',
            'term_months' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $somiti = Somiti::findOrFail($request->somiti_id);
        $activeYear = $somiti->activeFinancialYear();

        if (!$activeYear) {
            return response()->json(['message' => 'No active financial year.'], 400);
        }

        $loan = Loan::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $activeYear->id,
            'user_id' => $user->id,
            'amount' => $request->amount,
            'term_months' => $request->term_months,
            'purpose' => $request->purpose,
            'status' => 'pending',
            // Interest rate logic would come from Somiti settings, hardcoded for now
            'interest_rate' => 10.00,
            'outstanding_balance' => $request->amount, // Initial balance
        ]);

        return response()->json(['message' => 'Loan request submitted.', 'loan' => $loan], 201);
    }

    /**
     * Approve loan (Manager/Admin).
     * This just marks it as approved, ready for disbursement.
     */
    public function approve(Request $request, $id)
    {
        $approver = $request->user();
        $loan = Loan::findOrFail($id);

        if ($loan->status !== 'pending') {
            return response()->json(['message' => 'Loan is not pending.'], 400);
        }

        $loan->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Loan approved. Ready for disbursement.', 'loan' => $loan]);
    }

    /**
     * Disburse Loan (Write to Ledger).
     * This moves money from Somiti to User.
     */
    public function disburse(Request $request, $id)
    {
        DB::transaction(function () use ($id, $request) {
            $loan = Loan::lockForUpdate()->findOrFail($id);

            if ($loan->status !== 'approved') {
                throw new \Exception('Loan must be approved before disbursement.');
            }

            $loan->update([
                'status' => 'disbursed',
                // 'disbursed_at' => now(), // Assuming column exists or use created_at of ledger
            ]);

            // Debit the Member's Account (Loan is a liability for member? Or Asset for Somiti?)
            // In User Ledger:
            // Deposit = Credit (Money user owns)
            // Loan Taken = Debit (Money user owes/took)

            Ledger::create([
                'somiti_id' => $loan->somiti_id,
                'user_id' => $loan->user_id,
                'transaction_ref' => 'LN-DIS-' . strtoupper(Str::random(8)),
                'type' => 'loan_disbursement',
                'amount' => $loan->amount,
                'dr_cr' => 'dr', // Debit the user (they owe this)
                'status' => 'completed',
                'reference_id' => $loan->id,
                'reference_type' => Loan::class,
                'description' => "Loan disbursed for {$loan->purpose}",
            ]);
        });

        return response()->json(['message' => 'Loan disbursed successfully.']);
    }
}
