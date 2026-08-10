<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $seo = \App\Models\SeoSetting::where('page_name', 'home')->first();
    $cms = \App\Models\PageContent::all()->pluck('content', 'section_key');

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'seo' => $seo,
        'cms' => $cms,
    ]);
})->name('home');

// Override Fortify logout to ensure API tokens are revoked on web logout
Route::post('logout', [App\Http\Controllers\Web\AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::middleware(['auth', 'verified', \App\Middleware\EnsureFirstTimeSomitiCreation::class])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Web\DashboardController::class, 'index'])->name('dashboard');

    // Somitis (web)
    Route::resource('somitis', App\Http\Controllers\Web\SomitiController::class)
        ->names(['destroy' => 'somitis.web.destroy']);
    Route::get('somitis/{somiti}/settings', [App\Http\Controllers\Web\SomitiSettingController::class, 'edit'])->name('somitis.settings.edit');
    Route::patch('somitis/{somiti}/settings', [App\Http\Controllers\Web\SomitiSettingController::class, 'update'])->name('somitis.settings.update');
    Route::get('somitis/{somiti}/members/create', [App\Http\Controllers\Web\SomitiMembershipController::class, 'create'])->name('somitis.members.create');
    Route::post('somitis/{somiti}/members', [App\Http\Controllers\Web\SomitiMembershipController::class, 'store'])->name('somitis.members.store');
    Route::put('somitis/{somiti}/members/{user}', [App\Http\Controllers\Web\SomitiMembershipController::class, 'update'])->name('somitis.members.update');
    Route::delete('somitis/{somiti}/members/{user}', [App\Http\Controllers\Web\SomitiMembershipController::class, 'destroy'])->name('somitis.members.destroy');

    // Receipts
    Route::get('somitis/{somiti}/receipts/deposit/{deposit}', [App\Http\Controllers\Web\ReceiptController::class, 'deposit'])->name('receipts.deposit');
    Route::get('somitis/{somiti}/receipts/loan/{loan}', [App\Http\Controllers\Web\ReceiptController::class, 'loan'])->name('receipts.loan');

    // Chat
    Route::get('chat', [App\Http\Controllers\Web\ChatRedirectController::class, 'index'])->name('chat.index');
    Route::get('somitis/{somiti}/chat', [App\Http\Controllers\Web\SomitiChatController::class, 'index'])->name('somitis.chat');
    Route::post('somitis/{somiti}/chat', [App\Http\Controllers\Web\SomitiChatController::class, 'send'])->name('somitis.chat.send');
    Route::post('somitis/{somiti}/typing', [App\Http\Controllers\Web\SomitiChatController::class, 'typing'])->name('somitis.chat.typing');

    // Reports
    Route::get('somitis/{somiti}/reports/trial-balance', [App\Http\Controllers\Web\ReportController::class, 'trialBalance'])->name('somitis.reports.trial-balance');
    Route::get('somitis/{somiti}/reports/summary', [App\Http\Controllers\Web\ReportController::class, 'summary'])->name('somitis.reports.summary');
    Route::get('somitis/{somiti}/reports/balance-sheet', [App\Http\Controllers\Web\ReportController::class, 'balanceSheet'])->name('somitis.reports.balance-sheet');
    Route::get('somitis/{somiti}/reports/portfolio', [App\Http\Controllers\Web\ReportController::class, 'portfolio'])->name('somitis.reports.portfolio');
    Route::get('somitis/{somiti}/reports/member-statement', [App\Http\Controllers\Web\ReportController::class, 'memberStatement'])->name('somitis.reports.member-statement');
    Route::get('somitis/{somiti}/reports/summary.csv', [App\Http\Controllers\Web\ReportController::class, 'summaryCsv'])->name('somitis.reports.summary.csv');
    Route::get('somitis/{somiti}/reports/member-statement.csv', [App\Http\Controllers\Web\ReportController::class, 'memberStatementCsv'])->name('somitis.reports.member-statement.csv');

    // Loan Repayments
    Route::get('repayments', [App\Http\Controllers\Web\LoanRepaymentController::class, 'index'])->name('web.repayments.index');
    Route::get('repayments/{repayment}', [App\Http\Controllers\Web\LoanRepaymentController::class, 'show'])->name('web.repayments.show');
    Route::get('loans/{loan}/repayments', [App\Http\Controllers\Web\LoanRepaymentController::class, 'forLoan'])->name('web.loans.repayments.index');
    Route::post('loans/{loan}/repayments', [App\Http\Controllers\Web\LoanRepaymentController::class, 'store'])->name('web.loans.repayments.store');
    Route::post('repayments/{repayment}/approve', [App\Http\Controllers\Web\LoanRepaymentController::class, 'approve'])->name('web.repayments.approve');
    Route::post('repayments/{repayment}/reject', [App\Http\Controllers\Web\LoanRepaymentController::class, 'reject'])->name('web.repayments.reject');

    // Withdrawals
    Route::get('withdrawals', [App\Http\Controllers\Web\WithdrawalController::class, 'index'])->name('web.withdrawals.index');
    Route::get('withdrawals/create', [App\Http\Controllers\Web\WithdrawalController::class, 'create'])->name('web.withdrawals.create');
    Route::post('withdrawals', [App\Http\Controllers\Web\WithdrawalController::class, 'store'])->name('web.withdrawals.store');
    Route::get('withdrawals/{withdrawal}', [App\Http\Controllers\Web\WithdrawalController::class, 'show'])->name('web.withdrawals.show');
    Route::post('withdrawals/{withdrawal}/approve', [App\Http\Controllers\Web\WithdrawalController::class, 'approve'])->name('web.withdrawals.approve');
    Route::post('withdrawals/{withdrawal}/reject', [App\Http\Controllers\Web\WithdrawalController::class, 'reject'])->name('web.withdrawals.reject');

    // Dividends
    Route::get('somitis/{somiti}/dividends', [App\Http\Controllers\Web\DividendController::class, 'index'])->name('web.somitis.dividends.index');
    Route::post('somitis/{somiti}/dividends', [App\Http\Controllers\Web\DividendController::class, 'store'])->name('web.somitis.dividends.store');
    Route::get('dividends/{declaration}', [App\Http\Controllers\Web\DividendController::class, 'show'])->name('web.dividends.show');
    Route::post('dividends/{declaration}/approve', [App\Http\Controllers\Web\DividendController::class, 'approve'])->name('web.dividends.approve');
    Route::post('dividends/{declaration}/reject', [App\Http\Controllers\Web\DividendController::class, 'reject'])->name('web.dividends.reject');

    // Penalties
    Route::get('penalties', [App\Http\Controllers\Web\PenaltyController::class, 'index'])->name('web.penalties.index');
    Route::get('penalties/create', [App\Http\Controllers\Web\PenaltyController::class, 'create'])->name('web.penalties.create');
    Route::post('penalties', [App\Http\Controllers\Web\PenaltyController::class, 'store'])->name('web.penalties.store');
    Route::get('penalties/{penalty}', [App\Http\Controllers\Web\PenaltyController::class, 'show'])->name('web.penalties.show');
    Route::post('penalties/{penalty}/approve', [App\Http\Controllers\Web\PenaltyController::class, 'approve'])->name('web.penalties.approve');
    Route::post('penalties/{penalty}/reject', [App\Http\Controllers\Web\PenaltyController::class, 'reject'])->name('web.penalties.reject');

    // Workflows
    Route::get('somitis/{somiti}/workflows', [App\Http\Controllers\Web\WorkflowController::class, 'edit'])->name('somitis.workflows.edit');
    Route::put('somitis/{somiti}/workflows', [App\Http\Controllers\Web\WorkflowController::class, 'update'])->name('somitis.workflows.update');

    // Monthly dues
    Route::get('somitis/{somiti}/dues', [App\Http\Controllers\Web\DuesController::class, 'index'])->name('somitis.dues');

    // Manager tenure
    Route::get('somitis/{somiti}/managers', [App\Http\Controllers\Web\ManagerController::class, 'index'])->name('somitis.managers.index');
    Route::post('somitis/{somiti}/managers', [App\Http\Controllers\Web\ManagerController::class, 'store'])->name('somitis.managers.store');
    Route::delete('somitis/{somiti}/managers/{manager}', [App\Http\Controllers\Web\ManagerController::class, 'destroy'])->name('somitis.managers.destroy');

    // Reports admin index
    Route::get('reports', [App\Http\Controllers\Web\ReportViewController::class, 'index'])->name('reports.index');

    // Bank Accounts
    Route::resource('bank-accounts', App\Http\Controllers\Web\BankAccountController::class)->only(['index', 'create', 'store', 'show', 'destroy']);

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
    Route::resource('deposits', App\Http\Controllers\Web\DepositController::class)->only(['index', 'show', 'create', 'store']);
    Route::resource('loans', App\Http\Controllers\Web\LoanController::class)->only(['index', 'show', 'create', 'store']);
    Route::resource('investments', App\Http\Controllers\Web\InvestmentController::class)->only(['index', 'show', 'create', 'store']);
    Route::resource('fdrs', App\Http\Controllers\Web\FdrController::class)->only(['index', 'show', 'create', 'store']);
    Route::resource('user-shares', App\Http\Controllers\Web\UserShareController::class)->only(['index', 'show', 'create', 'store']);
    Route::resource('share-types', App\Http\Controllers\Web\ShareController::class)->only(['index', 'show']);
    Route::resource('financial-years', App\Http\Controllers\Web\FinancialYearController::class)->only(['index', 'show', 'create', 'store', 'edit', 'update']);
    Route::resource('ledgers', App\Http\Controllers\Web\LedgerController::class)->only(['index', 'show']);
    Route::resource('share-transfers', App\Http\Controllers\Web\ShareTransferController::class)->only(['index', 'create', 'store']);

    Route::resource('approvals', App\Http\Controllers\Web\ApprovalController::class)->only(['index', 'show', 'update']);

    Route::get('profile/{user?}', [App\Http\Controllers\Web\MemberProfileController::class, 'show'])->name('profile.show');

    // Super Admin Routes
    Route::middleware(['super_admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Web\Admin\SuperAdminController::class, 'index'])->name('dashboard');
        Route::resource('advertisements', App\Http\Controllers\Web\Admin\AdvertisementController::class);
        Route::resource('users', App\Http\Controllers\Web\Admin\UserController::class)->only(['index', 'update', 'destroy']);
        Route::resource('seo', App\Http\Controllers\Web\Admin\SeoController::class);
        Route::get('cms', [App\Http\Controllers\Web\Admin\CmsController::class, 'index'])->name('cms.index');
        Route::post('cms', [App\Http\Controllers\Web\Admin\CmsController::class, 'update'])->name('cms.update');
        Route::resource('navigation', App\Http\Controllers\Web\Admin\NavigationController::class);
        Route::resource('pages', App\Http\Controllers\Web\Admin\PageController::class);
        Route::resource('blog-posts', App\Http\Controllers\Web\Admin\PostController::class);
        Route::resource('blog-categories', App\Http\Controllers\Web\Admin\CategoryController::class);
    });
});

Route::get('blog', [App\Http\Controllers\Web\PublicPageController::class, 'blog'])->name('public.blog');
Route::get('blog/{slug}', [App\Http\Controllers\Web\PublicPageController::class, 'showPost'])->name('public.blog.show');
Route::get('p/{slug}', [App\Http\Controllers\Web\PublicPageController::class, 'showPage'])->name('public.page.show');

require __DIR__.'/settings.php';
