<?php

use App\Models\Deposit;
use App\Models\FinancialYear;
use App\Models\JournalEntry;
use App\Models\Loan;
use App\Models\ManagerElection;
use App\Models\Somiti;
use App\Models\SomitiManager;
use App\Models\SomitiMember;
use App\Models\SomitiWorkflow;
use App\Models\User;
use App\Services\DuesService;
use Illuminate\Support\Facades\Auth;

function somitiWithOwner(): array
{
    $owner = User::factory()->create();
    $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
    $somiti->addMember($owner, 'owner');

    FinancialYear::factory()->create([
        'somiti_id' => $somiti->id,
        'title' => now()->format('Y').'-'.now()->addYear()->format('y'),
        'is_active' => true,
    ]);

    return [$somiti, $owner];
}

test('manager tenure: appointing a manager sets role and ending reverts it', function () {
    [$somiti, $owner] = somitiWithOwner();
    $manager = User::factory()->create();
    $somiti->addMember($manager, 'member');

    $this->actingAs($owner)
        ->postJson("/api/somitis/{$somiti->id}/managers", [
            'user_id' => $manager->id,
            'from_date' => now()->format('Y-m-d'),
        ])
        ->assertStatus(201);

    expect($manager->isManagerOfSomiti($somiti->id))->toBeTrue();
    expect(SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $manager->id)->first()->role)->toBe('manager');

    $managerRecord = SomitiManager::where('somiti_id', $somiti->id)->where('user_id', $manager->id)->first();

    $this->actingAs($owner)
        ->deleteJson("/api/somitis/{$somiti->id}/managers/{$managerRecord->id}")
        ->assertStatus(200);

    expect($manager->isManagerOfSomiti($somiti->id))->toBeFalse();
    expect(SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $manager->id)->first()->role)->toBe('member');
});

test('voting: two member votes finalize a deposit when quorum is met', function () {
    [$somiti, $owner] = somitiWithOwner();
    $memberA = User::factory()->create();
    $memberB = User::factory()->create();
    $memberC = User::factory()->create();
    $somiti->addMember($memberA, 'member');
    $somiti->addMember($memberB, 'member');
    $somiti->addMember($memberC, 'member');

    SomitiWorkflow::updateOrCreate(
        ['somiti_id' => $somiti->id, 'transaction_type' => 'deposit'],
        ['requires_approval' => true, 'manager_can_approve_alone' => false, 'min_approvals_required' => 2]
    );

    $deposit = Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $memberA->id,
        'amount' => 100,
        'type' => 'monthly',
        'status' => 'pending',
    ]);
    $deposit->requestApproval($owner->id);

    // The creator (memberA) cannot vote on their own request
    $this->actingAs($memberA)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(422);

    expect($deposit->fresh()->status)->toBe('pending');

    $this->actingAs($memberB)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);

    expect($deposit->fresh()->status)->toBe('pending');

    $response = $this->actingAs($memberC)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);

    expect($response->json('finalized'))->toBeTrue();
    expect($deposit->fresh()->status)->toBe('approved');
    expect(JournalEntry::where('reference_type', Deposit::class)->where('reference_id', $deposit->id)->exists())->toBeTrue();
});

test('voting: manager alone finalizes immediately when manager_can_approve_alone', function () {
    [$somiti, $owner] = somitiWithOwner();
    $member = User::factory()->create();
    $somiti->addMember($member, 'member');
    $manager = User::factory()->create();
    $somiti->addMember($manager, 'manager');

    SomitiWorkflow::updateOrCreate(
        ['somiti_id' => $somiti->id, 'transaction_type' => 'deposit'],
        ['requires_approval' => true, 'manager_can_approve_alone' => true, 'min_approvals_required' => 3]
    );

    $deposit = Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $member->id,
        'amount' => 100,
        'type' => 'monthly',
        'status' => 'pending',
    ]);
    $deposit->requestApproval($owner->id);

    $response = $this->actingAs($manager)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
        'signature' => 'Manager One',
    ])->assertStatus(200);

    expect($response->json('finalized'))->toBeTrue();
    expect($deposit->fresh()->status)->toBe('approved');
    expect($deposit->approvals()->where('status', 'approved')->first()->signature)->toBe('Manager One');
});

test('monthly dues: member schedule marks paid and due months', function () {
    [$somiti, $owner] = somitiWithOwner();
    $somiti->update(['monthly_deposit_amount' => 500, 'due_day' => min(now()->day + 5, 28)]);

    $member = User::factory()->create();
    $somiti->addMember($member, 'member');
    $membership = SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $member->id)->first();
    $membership->joined_at = now()->subMonths(2)->startOfMonth();
    $membership->save();

    // Paid last month
    Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $member->id,
        'amount' => 500,
        'type' => 'monthly',
        'status' => 'approved',
        'due_month' => now()->subMonth()->startOfMonth()->toDateString(),
    ]);

    $schedule = DuesService::memberDues($somiti, $member->id);
    $lastMonth = collect($schedule['months'])->firstWhere('month_key', now()->subMonth()->format('Y-m'));
    $currentMonth = collect($schedule['months'])->firstWhere('month_key', now()->format('Y-m'));

    expect($lastMonth['status'])->toBe('paid');
    expect($currentMonth['status'])->toBe('due');
    expect((float) $schedule['total_paid'])->toBe(500.0);

    // Manager overview contains the member
    $this->actingAs($owner)->getJson("/api/somitis/{$somiti->id}/dues")
        ->assertStatus(200)
        ->assertJsonPath('settings.monthly_deposit_amount', '500.00');
});

test('backfill: creates pending deposits for past months and marks paid months approved', function () {
    [$somiti, $owner] = somitiWithOwner();
    $somiti->update(['monthly_deposit_amount' => 300]);
    $member = User::factory()->create();
    $somiti->addMember($member, 'member');

    $from = now()->subMonths(2)->format('Y-m');
    $paidMonth = now()->subMonth()->format('Y-m');

    $response = $this->actingAs($owner)->postJson("/api/somitis/{$somiti->id}/members/{$member->id}/backfill", [
        'from_date' => $from,
        'paid_months' => [['month' => $paidMonth, 'amount' => 300]],
    ])->assertStatus(200);

    expect($response->json('created_pending'))->toBe(2);
    expect($response->json('marked_paid'))->toBe(1);

    expect(Deposit::where('somiti_id', $somiti->id)->where('user_id', $member->id)->where('status', 'pending')->count())->toBe(2);
    expect(Deposit::where('somiti_id', $somiti->id)->where('user_id', $member->id)->where('status', 'approved')->count())->toBe(1);

    // Idempotent — running again adds nothing
    $this->actingAs($owner)->postJson("/api/somitis/{$somiti->id}/members/{$member->id}/backfill", [
        'from_date' => $from,
    ])->assertStatus(200)->assertJsonPath('created_pending', 0);
});

test('legacy loan: records an already-disbursed loan with journal entry', function () {
    [$somiti, $owner] = somitiWithOwner();
    $member = User::factory()->create();
    $somiti->addMember($member, 'member');

    $response = $this->actingAs($owner)->postJson("/api/somitis/{$somiti->id}/loans/legacy", [
        'user_id' => $member->id,
        'principal' => 5000,
        'outstanding_balance' => 3000,
        'interest_rate' => 5,
        'term_months' => 12,
        'start_date' => now()->subMonths(3)->format('Y-m-d'),
        'purpose' => 'Old loan',
    ])->assertStatus(201);

    $loan = Loan::find($response->json('id'));
    expect($loan->status)->toBe('disbursed');
    expect((float) $loan->outstanding_balance)->toBe(3000.0);
    expect(JournalEntry::where('reference_type', Loan::class)->where('reference_id', $loan->id)->exists())->toBeTrue();
});

test('my-dues endpoint returns the authenticated member schedule', function () {
    [$somiti, $owner] = somitiWithOwner();
    $somiti->update(['monthly_deposit_amount' => 400]);
    $member = User::factory()->create();
    $somiti->addMember($member, 'member');

    $this->actingAs($member)->getJson("/api/somitis/{$somiti->id}/my-dues")
        ->assertStatus(200)
        ->assertJsonStructure(['months' => [['month_key', 'expected', 'paid', 'status']]]);
});

test('API store creates an approval request that appears in the approvals list', function () {
    [$somiti, $owner] = somitiWithOwner();
    $member = User::factory()->create();
    $somiti->addMember($member, 'member');

    $this->actingAs($member)->postJson('/api/deposits', [
        'somiti_id' => $somiti->id,
        'amount' => 500,
        'type' => 'monthly',
    ])->assertStatus(201);

    expect(\App\Models\Approval::where('user_id', $owner->id)->count())->toBe(1);

    $this->actingAs($owner)->getJson('/api/approvals')
        ->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('approvals index hides stale pending rows after finalization', function () {
    [$somiti, $owner] = somitiWithOwner();
    $memberA = User::factory()->create();
    $memberB = User::factory()->create();
    $somiti->addMember($memberA, 'member');
    $somiti->addMember($memberB, 'member');

    SomitiWorkflow::updateOrCreate(
        ['somiti_id' => $somiti->id, 'transaction_type' => 'deposit'],
        ['requires_approval' => true, 'manager_can_approve_alone' => false, 'min_approvals_required' => 1]
    );

    $deposit = Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $memberA->id,
        'amount' => 100,
        'type' => 'monthly',
        'status' => 'pending',
    ]);
    $deposit->requestApproval($owner->id);
    $deposit->approvals()->create(['user_id' => $memberB->id, 'status' => 'pending']);

    // memberB approves → quorum (1) met → finalized; memberA's pending row is stale
    $this->actingAs($memberB)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);

    $this->actingAs($owner)->getJson('/api/approvals')
        ->assertStatus(200)
        ->assertJsonCount(0, 'data');
});

test('all-members quorum requires every active member to vote', function () {
    [$somiti, $owner] = somitiWithOwner();
    $memberA = User::factory()->create();
    $memberB = User::factory()->create();
    $memberC = User::factory()->create();
    $somiti->addMember($memberA, 'member');
    $somiti->addMember($memberB, 'member');
    $somiti->addMember($memberC, 'member');

    SomitiWorkflow::updateOrCreate(
        ['somiti_id' => $somiti->id, 'transaction_type' => 'deposit'],
        ['requires_approval' => true, 'manager_can_approve_alone' => false, 'min_approvals_required' => 1, 'quorum_type' => 'all_members']
    );

    $deposit = Deposit::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $memberA->id,
        'amount' => 100,
        'type' => 'monthly',
        'status' => 'pending',
    ]);
    $deposit->requestApproval($owner->id);

    // 4 active members (owner + A + B + C); creator A excluded → 3 votes needed
    $this->actingAs($owner)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);
    expect($deposit->fresh()->status)->toBe('pending');

    $this->actingAs($memberB)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);
    expect($deposit->fresh()->status)->toBe('pending');

    $this->actingAs($memberC)->postJson('/api/approvals/vote', [
        'approvable_type' => Deposit::class,
        'approvable_id' => $deposit->id,
        'decision' => 'approved',
    ])->assertStatus(200);

    expect($deposit->fresh()->status)->toBe('approved');
});

test('majority quorum: most votes decide a loan', function () {
    [$somiti, $owner] = somitiWithOwner();
    $memberA = User::factory()->create();
    $memberB = User::factory()->create();
    $memberC = User::factory()->create();
    $somiti->addMember($memberA, 'member');
    $somiti->addMember($memberB, 'member');
    $somiti->addMember($memberC, 'member');

    SomitiWorkflow::updateOrCreate(
        ['somiti_id' => $somiti->id, 'transaction_type' => 'loan'],
        ['requires_approval' => true, 'manager_can_approve_alone' => false, 'min_approvals_required' => 1, 'quorum_type' => 'majority']
    );

    $loan = Loan::create([
        'somiti_id' => $somiti->id,
        'financial_year_id' => $somiti->financialYears()->first()->id,
        'user_id' => $memberA->id,
        'amount' => 5000,
        'term_months' => 12,
        'status' => 'pending',
    ]);
    $loan->requestApproval($owner->id);

    // 2 approve (owner + B) vs 1 reject (C): 4 eligible, majority needs 3 → still pending
    foreach ([[$owner, 'approved'], [$memberB, 'approved'], [$memberC, 'rejected']] as [$u, $d]) {
        $this->actingAs($u)->postJson('/api/approvals/vote', [
            'approvable_type' => Loan::class,
            'approvable_id' => $loan->id,
            'decision' => $d,
        ])->assertStatus(200);
    }
    expect($loan->fresh()->status)->toBe('pending');

    // 3rd approve (any remaining eligible member) → majority reached
    $memberD = User::factory()->create();
    $somiti->addMember($memberD, 'member');
    $this->actingAs($memberD)->postJson('/api/approvals/vote', [
        'approvable_type' => Loan::class,
        'approvable_id' => $loan->id,
        'decision' => 'approved',
    ])->assertStatus(200);

    expect($loan->fresh()->status)->toBe('approved');
});

test('manager election: majority vote appoints the candidate', function () {
    [$somiti, $owner] = somitiWithOwner();
    $candidate = User::factory()->create();
    $voterA = User::factory()->create();
    $voterB = User::factory()->create();
    $somiti->addMember($candidate, 'member');
    $somiti->addMember($voterA, 'member');
    $somiti->addMember($voterB, 'member');

    $this->actingAs($owner)->postJson("/api/somitis/{$somiti->id}/manager-elections", [
        'candidate_user_id' => $candidate->id,
        'from_date' => now()->format('Y-m-d'),
    ])->assertStatus(201);

    $election = ManagerElection::where('somiti_id', $somiti->id)->first();

    // Candidate cannot vote for themselves
    $this->actingAs($candidate)->postJson('/api/approvals/vote', [
        'approvable_type' => ManagerElection::class,
        'approvable_id' => $election->id,
        'decision' => 'approved',
    ])->assertStatus(422);

    // 4 active members (owner + candidate + A + B), majority needs 3: owner + A + B approve
    foreach ([$owner, $voterA, $voterB] as $u) {
        $this->actingAs($u)->postJson('/api/approvals/vote', [
            'approvable_type' => ManagerElection::class,
            'approvable_id' => $election->id,
            'decision' => 'approved',
        ])->assertStatus(200);
    }

    expect($election->fresh()->status)->toBe('approved');
    expect($candidate->isManagerOfSomiti($somiti->id))->toBeTrue();
    expect(SomitiManager::where('somiti_id', $somiti->id)->where('user_id', $candidate->id)->exists())->toBeTrue();
});
