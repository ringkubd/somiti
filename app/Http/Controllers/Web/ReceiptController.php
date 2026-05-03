<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Loan;
use App\Models\Somiti;
use App\Services\AccountingService;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    public function deposit(Somiti $somiti, Deposit $deposit)
    {
        if ($deposit->somiti_id !== $somiti->id) {
            abort(404);
        }

        $somiti->load('createdBy');

        return Inertia::render('Receipts/Deposit', [
            'somiti' => $somiti,
            'deposit' => $deposit->load(['user', 'financialYear', 'approver']),
        ]);
    }

    public function loan(Somiti $somiti, Loan $loan)
    {
        if ($loan->somiti_id !== $somiti->id) {
            abort(404);
        }

        $somiti->load('createdBy');

        return Inertia::render('Receipts/Loan', [
            'somiti' => $somiti,
            'loan' => $loan->load(['user', 'financialYear']),
        ]);
    }
}
