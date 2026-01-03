<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
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

    // Shares (share metadata)
    Route::apiResource('share-types', App\Http\Controllers\Api\ShareController::class);

    // Approvals
    Route::get('approvals', [App\Http\Controllers\Api\ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/{approval}/decide', [App\Http\Controllers\Api\ApprovalController::class, 'decide'])->name('approvals.decide');

    // Ledgers
    Route::get('ledgers', [App\Http\Controllers\Api\LedgerController::class, 'index'])->name('ledgers.index');
    Route::get('ledgers/{ledger}', [App\Http\Controllers\Api\LedgerController::class, 'show'])->name('ledgers.show');

    // Somitis
    Route::apiResource('somitis', App\Http\Controllers\Api\SomitiController::class);

    // Notifications
    Route::get('notifications', [App\Http\Controllers\Api\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [App\Http\Controllers\Api\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/{notification}/mark-read', [App\Http\Controllers\Api\NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::delete('notifications/{notification}', [App\Http\Controllers\Api\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Users
    Route::get('users/{user}', [App\Http\Controllers\Api\UserController::class, 'show'])->name('users.show');
    Route::put('users/{user}', [App\Http\Controllers\Api\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy'])->name('users.destroy');
});
