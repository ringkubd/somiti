<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\Deposit::observe(\App\Observers\DepositObserver::class);
        \App\Models\Loan::observe(\App\Observers\LoanObserver::class);
        \App\Models\Approval::observe(\App\Observers\ApprovalObserver::class);
        \App\Models\Investment::observe(\App\Observers\InvestmentObserver::class);
        \App\Models\Fdr::observe(\App\Observers\FdrObserver::class);
        \App\Models\UserShare::observe(\App\Observers\UserShareObserver::class);
        \App\Models\SomitiManager::observe(\App\Observers\SomitiManagerObserver::class);
        \App\Models\FinancialYear::observe(\App\Observers\FinancialYearObserver::class);
        \App\Models\Share::observe(\App\Observers\ShareObserver::class);
    }
}
