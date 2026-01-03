<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Somitis (web)
    Route::resource('somitis', App\Http\Controllers\Web\SomitiController::class);
    Route::post('somitis/{somiti}/users', [App\Http\Controllers\Web\SomitiMembershipController::class, 'store'])->name('somitis.users.store');
    Route::delete('somitis/{somiti}/users/{user}', [App\Http\Controllers\Web\SomitiMembershipController::class, 'destroy'])->name('somitis.users.destroy');

    // Notifications (web)
    Route::get('notifications', [App\Http\Controllers\Web\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [App\Http\Controllers\Web\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/{notification}/mark-read', [App\Http\Controllers\Web\NotificationController::class, 'markRead'])->name('notifications.markRead');
    Route::delete('notifications/{notification}', [App\Http\Controllers\Web\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Users (web)
    Route::get('users/{user}', [App\Http\Controllers\Web\UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [App\Http\Controllers\Web\UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [App\Http\Controllers\Web\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [App\Http\Controllers\Web\UserController::class, 'destroy'])->name('users.destroy');

    // Other web resources
    Route::resource('deposits', App\Http\Controllers\Web\DepositController::class)->only(['index', 'show']);
    Route::resource('loans', App\Http\Controllers\Web\LoanController::class)->only(['index', 'show']);
    Route::resource('investments', App\Http\Controllers\Web\InvestmentController::class)->only(['index', 'show']);
    Route::resource('fdrs', App\Http\Controllers\Web\FdrController::class)->only(['index', 'show']);
    Route::resource('user-shares', App\Http\Controllers\Web\UserShareController::class)->only(['index', 'show']);
    Route::resource('share-types', App\Http\Controllers\Web\ShareController::class)->only(['index', 'show']);
    Route::resource('financial-years', App\Http\Controllers\Web\FinancialYearController::class)->only(['index', 'show']);
    Route::resource('ledgers', App\Http\Controllers\Web\LedgerController::class)->only(['index', 'show']);
    Route::resource('approvals', App\Http\Controllers\Web\ApprovalController::class)->only(['index', 'show']);
});

require __DIR__ . '/settings.php';
