<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\LoanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Deposit Routes
    Route::post('/deposits', [DepositController::class, 'store']); // Request deposit
    Route::post('/deposits/{id}/approve', [DepositController::class, 'approve']); // Approve deposit (Manager)

    // Loan Routes
    Route::post('/loans', [LoanController::class, 'store']); // Request loan
    Route::post('/loans/{id}/approve', [LoanController::class, 'approve']); // Approve loan
    Route::post('/loans/{id}/disburse', [LoanController::class, 'disburse']); // Disburse loan (Ledger write)
});
