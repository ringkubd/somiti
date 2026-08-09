<?php

namespace Tests\Feature;

use App\Models\Deposit;
use App\Models\FinancialYear;
use App\Models\JournalEntry;
use App\Models\Somiti;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WithdrawalTest extends TestCase
{
    use RefreshDatabase;

    private function setUpWithSavings(): array
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create([
            'somiti_id' => $somiti->id,
            'title' => 'FY 2026',
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
        ]);

        // Member deposits 2000 → creates a member savings balance on approval
        $deposit = Deposit::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'user_id' => $member->id,
            'amount' => 2000,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('deposits.approve', ['deposit' => $deposit->id]))->assertStatus(200);

        return compact('owner', 'manager', 'member', 'somiti', 'fy');
    }

    public function test_member_withdraws_and_manager_approves_with_balanced_journal()
    {
        ['manager' => $manager, 'member' => $member, 'somiti' => $somiti] = $this->setUpWithSavings();

        Sanctum::actingAs($member, ['*']);

        $response = $this->postJson(route('withdrawals.store'), [
            'somiti_id' => $somiti->id,
            'amount' => 500,
            'reason' => 'Medical emergency',
            'method' => 'cash',
        ]);

        $response->assertStatus(201);

        $withdrawal = Withdrawal::where('somiti_id', $somiti->id)->first();
        $this->assertNotNull($withdrawal);
        $this->assertSame('pending', $withdrawal->status);

        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('withdrawals.approve', ['withdrawal' => $withdrawal->id]))->assertStatus(200);

        $this->assertSame('approved', $withdrawal->fresh()->status);

        $entry = JournalEntry::where('reference_type', Withdrawal::class)
            ->where('reference_id', $withdrawal->id)
            ->first();

        $this->assertNotNull($entry);
        $this->assertTrue($entry->isBalanced());
        $this->assertEquals(500, $entry->totalDebit());
        $this->assertEquals(500, $entry->totalCredit());

        $result = \App\Services\AccountingService::verifyBalances($somiti->id);
        $this->assertTrue($result['balanced']);
    }

    public function test_withdrawal_exceeding_savings_is_rejected()
    {
        ['member' => $member, 'somiti' => $somiti] = $this->setUpWithSavings();

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('withdrawals.store'), [
            'somiti_id' => $somiti->id,
            'amount' => 5000,
        ])->assertStatus(422);

        $this->assertDatabaseCount('withdrawals', 0);
    }
}
