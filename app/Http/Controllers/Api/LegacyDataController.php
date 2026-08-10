<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\User;
use App\Services\AccountingService;
use App\Services\DuesService;
use App\Services\ManagerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LegacyDataController extends Controller
{
    /**
     * Backfill monthly deposits for a member since a given month.
     * Months with an existing deposit are skipped (idempotent).
     */
    public function backfillDeposits(Request $request, Somiti $somiti, User $user)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'from_date' => 'required|date_format:Y-m',
            'monthly_amount' => 'nullable|numeric|min:0.01',
            'paid_months' => 'nullable|array',
            'paid_months.*.month' => 'required|date_format:Y-m',
            'paid_months.*.amount' => 'nullable|numeric|min:0.01',
            'paid_months.*.note' => 'nullable|string|max:500',
        ]);

        $member = \App\Models\SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $user->id)->first();
        if (! $member) {
            abort(422, 'User is not a member of this somiti.');
        }

        $amount = (float) ($validated['monthly_amount'] ?? $somiti->monthly_deposit_amount ?? 0);
        if ($amount <= 0) {
            throw ValidationException::withMessages(['monthly_amount' => 'Set a monthly amount (somiti setting or this request).']);
        }

        $from = Carbon::createFromFormat('Y-m', $validated['from_date'])->startOfMonth();
        $now = now()->startOfMonth();
        $financialYear = $somiti->financialYears()->where('is_active', true)->where('is_closed', false)->latest('id')->first();
        $keys = DuesService::monthKeysBetween($from, $now);

        $paidMonths = [];
        foreach ($validated['paid_months'] ?? [] as $paid) {
            $paidMonths[$paid['month']] = $paid;
        }

        $created = 0;
        $approved = 0;
        foreach ($keys as $key) {
            $monthDate = Carbon::createFromFormat('Y-m', $key)->startOfMonth();
            $exists = Deposit::where('somiti_id', $somiti->id)
                ->where('user_id', $user->id)
                ->whereDate('due_month', $monthDate)
                ->exists();

            if ($exists) {
                continue;
            }

            $isPaid = isset($paidMonths[$key]);
            $paidAmount = $isPaid ? (float) ($paidMonths[$key]['amount'] ?? $amount) : $amount;

            Deposit::create([
                'somiti_id' => $somiti->id,
                'financial_year_id' => $financialYear?->id,
                'user_id' => $user->id,
                'month' => $monthDate->format('F'),
                'due_month' => $monthDate->toDateString(),
                'amount' => $paidAmount,
                'type' => 'monthly',
                'status' => $isPaid ? 'approved' : 'pending',
                'approved_by' => $isPaid ? Auth::id() : null,
                'approved_at' => $isPaid ? now() : null,
                'notes' => $isPaid
                    ? ($paidMonths[$key]['note'] ?? "Backfilled paid month {$key}")
                    : "Backfilled for {$key}",
            ]);

            if ($isPaid) {
                $approved++;
            } else {
                $created++;
            }
        }

        return response()->json([
            'created_pending' => $created,
            'marked_paid' => $approved,
            'member' => $user->only(['id', 'name', 'phone', 'email']),
        ]);
    }

    /**
     * Record an existing (legacy) loan that is already disbursed.
     */
    public function legacyLoan(Request $request, Somiti $somiti)
    {
        if (! ManagerService::canManage($somiti, Auth::user())) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'principal' => 'required|numeric|min:0.01',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'term_months' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'purpose' => 'nullable|string|max:500',
        ]);

        $member = \App\Models\SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $validated['user_id'])->exists();
        if (! $member) {
            abort(422, 'User is not a member of this somiti.');
        }

        $financialYear = $somiti->financialYears()->where('is_active', true)->where('is_closed', false)->latest('id')->first();

        $loan = Loan::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $financialYear?->id,
            'user_id' => $validated['user_id'],
            'amount' => $validated['principal'],
            'outstanding_balance' => $validated['outstanding_balance'] ?? $validated['principal'],
            'interest_rate' => $validated['interest_rate'] ?? $somiti->default_interest_rate ?? 0,
            'term_months' => $validated['term_months'] ?? 12,
            'purpose' => $validated['purpose'] ?? 'Legacy loan',
            'status' => 'disbursed',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'disbursed_at' => Carbon::parse($validated['start_date']),
        ]);

        try {
            AccountingService::recordLoanDisbursement($loan);
        } catch (\Throwable $e) {
            // Accounting setup may not exist for very old data — don't fail the import
            \Log::warning('Legacy loan journal skipped: '.$e->getMessage());
        }

        return response()->json($loan->load('user'), 201);
    }
}
