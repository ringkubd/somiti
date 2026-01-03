<?php

namespace App\Providers;

use App\Models\Deposit;
use App\Models\Loan;
use App\Models\Somiti;
use App\Policies\DepositPolicy;
use App\Policies\LoanPolicy;
use App\Policies\SomitiPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Somiti::class => SomitiPolicy::class,
        Deposit::class => DepositPolicy::class,
        Loan::class => LoanPolicy::class,
        Investment::class => \App\Policies\InvestmentPolicy::class,
        Fdr::class => \App\Policies\FdrPolicy::class,
        UserShare::class => \App\Policies\UserSharePolicy::class,
        FinancialYear::class => \App\Policies\FinancialYearPolicy::class,
        Share::class => \App\Policies\SharePolicy::class,
        Approval::class => \App\Policies\ApprovalPolicy::class,
        Ledger::class => \App\Policies\LedgerPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();

        // Additional gates if needed
        Gate::define('manage-somiti', function ($user, $somiti) {
            return $user->isManagerOfSomiti($somiti->id) || $user->isOwnerOfSomiti($somiti->id);
        });
    }
}
