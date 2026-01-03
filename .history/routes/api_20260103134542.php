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
});
