<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_somitis' => \App\Models\Somiti::count(),
                'total_users' => \App\Models\User::count(),
                'total_memberships' => \App\Models\SomitiMember::count(),
                'total_deposits' => \App\Models\Deposit::where('status', 'approved')->sum('amount'),
                'total_loans' => \App\Models\Loan::whereIn('status', ['approved', 'disbursed'])->sum('amount'),
            ],
        ]);
    }
}
