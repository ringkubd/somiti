<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index'])->name('dashboard.index');
    Route::apiResource('deposits', App\Http\Controllers\Api\DepositController::class);
    Route::post('deposits/{deposit}/approve', [App\Http\Controllers\Api\DepositController::class, 'approve'])->name('deposits.approve');

    Route::apiResource('loans', App\Http\Controllers\Api\LoanController::class);
    Route::post('loans/{loan}/approve', [App\Http\Controllers\Api\LoanController::class, 'approve'])->name('loans.approve');
    Route::post('loans/{loan}/disburse', [App\Http\Controllers\Api\LoanController::class, 'disburse'])->name('loans.disburse');
    Route::get('repayments', [App\Http\Controllers\Api\LoanRepaymentController::class, 'index'])->name('repayments.index');
    Route::get('loans/{loan}/repayments', [App\Http\Controllers\Api\LoanRepaymentController::class, 'forLoan'])->name('loans.repayments.index');
    Route::post('loans/{loan}/repayments', [App\Http\Controllers\Api\LoanRepaymentController::class, 'store'])->name('loans.repayments.store');
    Route::post('repayments/{repayment}/approve', [App\Http\Controllers\Api\LoanRepaymentController::class, 'approve'])->name('repayments.approve');
    Route::post('repayments/{repayment}/reject', [App\Http\Controllers\Api\LoanRepaymentController::class, 'reject'])->name('repayments.reject');

    // Withdrawals
    Route::get('withdrawals', [App\Http\Controllers\Api\WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('withdrawals', [App\Http\Controllers\Api\WithdrawalController::class, 'store'])->name('withdrawals.store');
    Route::get('withdrawals/{withdrawal}', [App\Http\Controllers\Api\WithdrawalController::class, 'show'])->name('withdrawals.show');
    Route::post('withdrawals/{withdrawal}/approve', [App\Http\Controllers\Api\WithdrawalController::class, 'approve'])->name('withdrawals.approve');
    Route::post('withdrawals/{withdrawal}/reject', [App\Http\Controllers\Api\WithdrawalController::class, 'reject'])->name('withdrawals.reject');

    // Penalties
    Route::get('penalties', [App\Http\Controllers\Api\PenaltyController::class, 'index'])->name('penalties.index');
    Route::post('penalties', [App\Http\Controllers\Api\PenaltyController::class, 'store'])->name('penalties.store');
    Route::get('penalties/{penalty}', [App\Http\Controllers\Api\PenaltyController::class, 'show'])->name('penalties.show');
    Route::post('penalties/{penalty}/approve', [App\Http\Controllers\Api\PenaltyController::class, 'approve'])->name('penalties.approve');
    Route::post('penalties/{penalty}/reject', [App\Http\Controllers\Api\PenaltyController::class, 'reject'])->name('penalties.reject');

    // Investments
    Route::apiResource('investments', App\Http\Controllers\Api\InvestmentController::class);
    Route::post('investments/{investment}/approve', [App\Http\Controllers\Api\InvestmentController::class, 'approve'])->name('investments.approve');

    // FDRs
    Route::apiResource('fdrs', App\Http\Controllers\Api\FdrController::class);
    Route::post('fdrs/{fdr}/approve', [App\Http\Controllers\Api\FdrController::class, 'approve'])->name('fdrs.approve');

    // User shares
    Route::apiResource('shares', App\Http\Controllers\Api\UserShareController::class);
    Route::post('shares/{share}/approve', [App\Http\Controllers\Api\UserShareController::class, 'approve'])->name('shares.approve');

    // Financial years
    Route::apiResource('financial-years', App\Http\Controllers\Api\FinancialYearController::class);
    Route::post('financial-years/{financial_year}/activate', [App\Http\Controllers\Api\FinancialYearController::class, 'activate'])->name('financial-years.activate');
    Route::post('financial-years/{financial_year}/close', [App\Http\Controllers\Api\FinancialYearController::class, 'close'])->name('financial-years.close');

    // Shares (share metadata)
    Route::apiResource('share-types', App\Http\Controllers\Api\ShareController::class);

    // Approvals
    Route::get('approvals', [App\Http\Controllers\Api\ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/vote', [App\Http\Controllers\Api\ApprovalController::class, 'vote'])->name('approvals.vote');
    Route::post('approvals/{approval}/decide', [App\Http\Controllers\Api\ApprovalController::class, 'decide'])->name('approvals.decide');

    // Ledgers
    Route::get('ledgers', [App\Http\Controllers\Api\LedgerController::class, 'index'])->name('ledgers.index');
    Route::get('ledgers/{ledger}', [App\Http\Controllers\Api\LedgerController::class, 'show'])->name('ledgers.show');

    // Audit Trail
    Route::get('audit/trail', [App\Http\Controllers\Api\AuditController::class, 'index'])->name('audit.trail');
    Route::get('audit/trail/{entityType}/{entityId}', [App\Http\Controllers\Api\AuditController::class, 'showByEntity'])->name('audit.entity');
    Route::get('audit/summary', [App\Http\Controllers\Api\AuditController::class, 'summary'])->name('audit.summary');

    // Financial Reports
    Route::get('reports/trial-balance', [App\Http\Controllers\Api\LedgerController::class, 'trialBalance'])->name('reports.trial-balance');
    Route::get('reports/verify', [App\Http\Controllers\Api\LedgerController::class, 'verifyBalancesCheck'])->name('reports.verify');
    Route::get('reports/summary', [App\Http\Controllers\Api\LedgerController::class, 'summary'])->name('reports.summary');
    Route::get('somitis/{somiti}/reports/balance-sheet', [App\Http\Controllers\Api\ReportApiController::class, 'balanceSheet'])->name('reports.balance-sheet');
    Route::get('somitis/{somiti}/reports/profit-loss', [App\Http\Controllers\Api\ReportApiController::class, 'profitLoss'])->name('reports.profit-loss');
    Route::get('somitis/{somiti}/reports/portfolio', [App\Http\Controllers\Api\ReportApiController::class, 'portfolio'])->name('reports.portfolio');
    Route::get('somitis/{somiti}/reports/members', [App\Http\Controllers\Api\ReportApiController::class, 'memberProfiles'])->name('reports.members');
    Route::get('somitis/{somiti}/reports/members/{user?}', [App\Http\Controllers\Api\ReportApiController::class, 'memberProfile'])->name('reports.member-profile');

    // Share Transfers
    Route::apiResource('share-transfers', App\Http\Controllers\Api\ShareTransferController::class)->only(['index', 'store', 'show']);
    Route::post('share-transfers/{share_transfer}/approve', [App\Http\Controllers\Api\ShareTransferController::class, 'approve'])->name('share-transfers.approve');
    Route::post('share-transfers/{share_transfer}/reject', [App\Http\Controllers\Api\ShareTransferController::class, 'reject'])->name('share-transfers.reject');

    // Bank Accounts
    Route::apiResource('bank-accounts', App\Http\Controllers\Api\BankAccountController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

    // Somiti Settings & Members
    Route::get('somitis/{somiti}/members', [App\Http\Controllers\Api\SomitiController::class, 'members'])->name('somitis.members');
    Route::get('somitis/{somiti}/dividends', [App\Http\Controllers\Api\DividendController::class, 'index'])->name('somitis.dividends.index');
    Route::post('somitis/{somiti}/dividends', [App\Http\Controllers\Api\DividendController::class, 'store'])->name('somitis.dividends.store');
    Route::get('dividends/{declaration}', [App\Http\Controllers\Api\DividendController::class, 'show'])->name('dividends.show');
    Route::post('dividends/{declaration}/approve', [App\Http\Controllers\Api\DividendController::class, 'approve'])->name('dividends.approve');
    Route::post('dividends/{declaration}/reject', [App\Http\Controllers\Api\DividendController::class, 'reject'])->name('dividends.reject');
    Route::get('somitis/{somiti}/settings', [App\Http\Controllers\Api\SomitiController::class, 'settings'])->name('somitis.settings');
    Route::get('currencies', [App\Http\Controllers\Api\SomitiController::class, 'currencies'])->name('currencies');
    Route::put('somitis/{somiti}/settings', [App\Http\Controllers\Api\SomitiSettingApiController::class, 'update'])->name('somitis.settings.update');
    Route::get('somitis/{somiti}/workflows', [App\Http\Controllers\Api\SomitiController::class, 'workflows'])->name('somitis.workflows');
    Route::put('somitis/{somiti}/workflows', [App\Http\Controllers\Api\SomitiController::class, 'updateWorkflows'])->name('somitis.workflows.update');
    Route::get('somitis/{somiti}/financial-years', [App\Http\Controllers\Api\SomitiController::class, 'financialYears'])->name('somitis.financial-years');
    Route::get('somitis/{somiti}/notification-preferences', [App\Http\Controllers\Api\SomitiController::class, 'notificationPreferences'])->name('somitis.notification-preferences');
    Route::put('somitis/{somiti}/notification-preferences', [App\Http\Controllers\Api\SomitiController::class, 'updateNotificationPreferences'])->name('somitis.notification-preferences.update');
    Route::get('somitis/{somiti}/receipts/deposit/{deposit}', [App\Http\Controllers\Api\ReceiptApiController::class, 'deposit'])->name('api.receipts.deposit');

    // Manager tenure
    Route::get('somitis/{somiti}/managers', [App\Http\Controllers\Api\ManagerController::class, 'index'])->name('somitis.managers.index');
    Route::post('somitis/{somiti}/managers', [App\Http\Controllers\Api\ManagerController::class, 'store'])->name('somitis.managers.store');
    Route::delete('somitis/{somiti}/managers/{manager}', [App\Http\Controllers\Api\ManagerController::class, 'destroy'])->name('somitis.managers.destroy');

    // Manager elections (majority vote)
    Route::get('somitis/{somiti}/manager-elections', [App\Http\Controllers\Api\ManagerElectionController::class, 'index'])->name('somitis.manager-elections.index');
    Route::post('somitis/{somiti}/manager-elections', [App\Http\Controllers\Api\ManagerElectionController::class, 'store'])->name('somitis.manager-elections.store');

    // Monthly dues
    Route::get('somitis/{somiti}/dues', [App\Http\Controllers\Api\DuesController::class, 'somitiDues'])->name('somitis.dues');
    Route::get('somitis/{somiti}/my-dues', [App\Http\Controllers\Api\DuesController::class, 'myDues'])->name('somitis.my-dues');

    // Legacy / backdated data
    Route::post('somitis/{somiti}/members/{user}/backfill', [App\Http\Controllers\Api\LegacyDataController::class, 'backfillDeposits'])->name('somitis.members.backfill');
    Route::post('somitis/{somiti}/loans/legacy', [App\Http\Controllers\Api\LegacyDataController::class, 'legacyLoan'])->name('somitis.loans.legacy');

    // Chat
    Route::get('somitis/{somiti}/messages', [App\Http\Controllers\Api\ChatController::class, 'messages'])->name('api.chat.messages');
    Route::post('somitis/{somiti}/messages', [App\Http\Controllers\Api\ChatController::class, 'send'])->name('api.chat.send');
    Route::post('somitis/{somiti}/typing', [App\Http\Controllers\Api\ChatController::class, 'typing'])->name('api.chat.typing');
    Route::post('chat/upload', [App\Http\Controllers\Api\ChatController::class, 'upload'])->name('api.chat.upload');

    // Authentication (API) - login and register are public
    Route::post('auth/register', [App\Http\Controllers\Api\AuthController::class, 'register'])->name('auth.register')->withoutMiddleware('auth:sanctum');
    Route::post('auth/login', [App\Http\Controllers\Api\AuthController::class, 'login'])->name('auth.login')->withoutMiddleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [App\Http\Controllers\Api\AuthController::class, 'logout'])->name('auth.logout');
        Route::get('auth/me', [App\Http\Controllers\Api\AuthController::class, 'me'])->name('auth.me');
        Route::put('auth/profile', [App\Http\Controllers\Api\AuthController::class, 'updateProfile'])->name('auth.profile.update');
        Route::put('auth/password', [App\Http\Controllers\Api\AuthController::class, 'updatePassword'])->name('auth.password.update');
        Route::post('auth/push-token', [App\Http\Controllers\Api\AuthController::class, 'pushToken'])->name('auth.push-token');

        // Somitis
        Route::apiResource('somitis', App\Http\Controllers\Api\SomitiController::class);
        Route::post('somitis/join', [App\Http\Controllers\Api\SomitiController::class, 'join'])->name('somitis.join');
        // Somiti members (manage members by somiti owner/manager)
        Route::post('somitis/{somiti}/users', [App\Http\Controllers\Api\SomitiMembershipController::class, 'store'])->name('somitis.users.store');
        Route::put('somitis/{somiti}/users/{user}', [App\Http\Controllers\Api\SomitiMembershipController::class, 'update'])->name('somitis.users.update');
        Route::delete('somitis/{somiti}/users/{user}', [App\Http\Controllers\Api\SomitiMembershipController::class, 'destroy'])->name('somitis.users.destroy');
    });

    // Notifications
    Route::get('notifications', [App\Http\Controllers\Api\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [App\Http\Controllers\Api\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/{notification}/mark-read', [App\Http\Controllers\Api\NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::delete('notifications/{notification}', [App\Http\Controllers\Api\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Users
    Route::get('users/search', [App\Http\Controllers\Api\UserController::class, 'search'])->name('users.search');
    Route::get('users/{user}', [App\Http\Controllers\Api\UserController::class, 'show'])->name('users.show');
    Route::put('users/{user}', [App\Http\Controllers\Api\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy'])->name('users.destroy');
    Route::post('users/{user}/permissions', [App\Http\Controllers\Api\UserController::class, 'assignPermission'])->name('users.assignPermission');
    Route::delete('users/{user}/permissions', [App\Http\Controllers\Api\UserController::class, 'revokePermission'])->name('users.revokePermission');
});
