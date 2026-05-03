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

    // Share Transfers
    Route::apiResource('share-transfers', App\Http\Controllers\Api\ShareTransferController::class)->only(['index', 'store', 'show']);
    Route::post('share-transfers/{share_transfer}/approve', [App\Http\Controllers\Api\ShareTransferController::class, 'approve'])->name('share-transfers.approve');
    Route::post('share-transfers/{share_transfer}/reject', [App\Http\Controllers\Api\ShareTransferController::class, 'reject'])->name('share-transfers.reject');

    // Bank Accounts
    Route::apiResource('bank-accounts', App\Http\Controllers\Api\BankAccountController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

    // Somiti Settings & Members
    Route::get('somitis/{somiti}/members', [App\Http\Controllers\Api\SomitiController::class, 'members'])->name('somitis.members');
    Route::get('somitis/{somiti}/settings', [App\Http\Controllers\Api\SomitiController::class, 'settings'])->name('somitis.settings');
    Route::put('somitis/{somiti}/settings', [App\Http\Controllers\Api\SomitiSettingApiController::class, 'update'])->name('somitis.settings.update');
    Route::get('somitis/{somiti}/workflows', [App\Http\Controllers\Api\SomitiController::class, 'workflows'])->name('somitis.workflows');
    Route::put('somitis/{somiti}/workflows', [App\Http\Controllers\Api\SomitiController::class, 'updateWorkflows'])->name('somitis.workflows.update');
    Route::get('somitis/{somiti}/financial-years', [App\Http\Controllers\Api\SomitiController::class, 'financialYears'])->name('somitis.financial-years');
    Route::get('somitis/{somiti}/notification-preferences', [App\Http\Controllers\Api\SomitiController::class, 'notificationPreferences'])->name('somitis.notification-preferences');
    Route::put('somitis/{somiti}/notification-preferences', [App\Http\Controllers\Api\SomitiController::class, 'updateNotificationPreferences'])->name('somitis.notification-preferences.update');
    Route::get('somitis/{somiti}/receipts/deposit/{deposit}', [App\Http\Controllers\Api\ReceiptApiController::class, 'deposit'])->name('api.receipts.deposit');

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

        // Somitis
        Route::apiResource('somitis', App\Http\Controllers\Api\SomitiController::class);
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
    Route::get('users/{user}', [App\Http\Controllers\Api\UserController::class, 'show'])->name('users.show');
    Route::put('users/{user}', [App\Http\Controllers\Api\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy'])->name('users.destroy');
    Route::post('users/{user}/permissions', [App\Http\Controllers\Api\UserController::class, 'assignPermission'])->name('users.assignPermission');
    Route::delete('users/{user}/permissions', [App\Http\Controllers\Api\UserController::class, 'revokePermission'])->name('users.revokePermission');
});
