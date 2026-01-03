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
});
