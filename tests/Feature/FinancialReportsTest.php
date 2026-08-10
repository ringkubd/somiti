<?php

use App\Models\Deposit;
use App\Models\FinancialYear;
use App\Models\Loan;
use App\Models\Somiti;
use App\Models\User;
use App\Services\ReportService;

function reportSomiti(): array
{
    $owner = User::factory()->create();
    $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id, 'monthly_deposit_amount' => 500, 'due_day' => 10]);
    $somiti->addMember($owner, 'owner');
    FinancialYear::factory()->create(['somiti_id' => $somiti->id, 'is_active' => true]);

    $member = User::factory()->create();
    $somiti->addMember($member, 'member');

    // Deposit approved by owner → ledger: Debit Cash / Credit Member Savings
    $deposit = Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $member->id,
        'amount' => 500,
        'type' => 'monthly',
        'status' => 'approved',
        'approved_by' => $owner->id,
        'approved_at' => now(),
    ]);
    $deposit->approvals()->create(['user_id' => $owner->id, 'status' => 'approved', 'decided_at' => now()]);
    \App\Services\AccountingService::recordDeposit($deposit);

    return [$somiti, $owner, $member];
}

test('balance sheet balances and reports assets/liabilities/equity', function () {
    [$somiti, $owner] = reportSomiti();

    $bs = ReportService::balanceSheet($somiti);

    expect($bs['balanced'])->toBeTrue();
    expect($bs['assets'])->toHaveCount(5);
    expect((float) collect($bs['assets'])->sum('amount'))->toBe(500.0);
    expect((float) collect($bs['liabilities'])->sum('amount'))->toBe(500.0);
    expect($bs['total_assets'])->toBe(500.0);
    expect($bs['total_liabilities'] + $bs['total_equity'])->toBe(500.0);
});

test('portfolio reports fund allocation', function () {
    [$somiti] = reportSomiti();

    $portfolio = ReportService::portfolio($somiti);

    expect($portfolio['cash'])->toBe(500.0);
    expect($portfolio['member_savings'])->toBe(500.0);
    expect($portfolio['total_fund'])->toBe(500.0);
});

test('member profile reports savings, dues and net worth', function () {
    [$somiti, , $member] = reportSomiti();

    $profile = ReportService::memberProfile($somiti, $member->id);

    expect((float) $profile['total_savings'])->toBe(500.0);
    expect($profile['dues']['total_expected'])->toBe(500.0);
    expect($profile['dues']['total_paid'])->toBe(500.0);
    expect($profile['net_worth'])->toBe(500.0);
});

test('balance sheet endpoint returns 200 for members', function () {
    [$somiti, , $member] = reportSomiti();

    $this->actingAs($member)
        ->getJson("/api/somitis/{$somiti->id}/reports/balance-sheet")
        ->assertStatus(200)
        ->assertJsonPath('balanced', true);
});

test('member profile endpoint is role restricted', function () {
    [$somiti, , $member] = reportSomiti();
    $other = User::factory()->create();
    $somiti->addMember($other, 'member');

    // A regular member cannot view another member's profile
    $this->actingAs($other)
        ->getJson("/api/somitis/{$somiti->id}/reports/members/{$member->id}")
        ->assertStatus(403);
});
