<?php

namespace Tests\Feature;

use App\Models\ChartOfAccount;
use App\Models\FinancialYear;
use App\Models\JournalEntry;
use App\Models\Penalty;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PenaltyTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_and_approve_penalty_with_balanced_journal()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('penalties.store'), [
            'somiti_id' => $somiti->id,
            'user_id' => $member->id,
            'type' => 'late_deposit',
            'amount' => 100,
            'notes' => 'Missed March installment',
        ]);

        $response->assertStatus(201);

        $penalty = Penalty::where('somiti_id', $somiti->id)->first();
        $this->assertNotNull($penalty);
        $this->assertSame('pending', $penalty->status);

        // Penalty income account seeded
        $this->assertDatabaseHas('chart_of_accounts', [
            'somiti_id' => $somiti->id,
            'code' => ChartOfAccount::CODE_INCOME_PENALTY,
        ]);

        $this->postJson(route('penalties.approve', ['penalty' => $penalty->id]))->assertStatus(200);

        $this->assertSame('approved', $penalty->fresh()->status);

        $entry = JournalEntry::where('reference_type', Penalty::class)
            ->where('reference_id', $penalty->id)
            ->first();

        $this->assertNotNull($entry);
        $this->assertTrue($entry->isBalanced());
        $this->assertEquals(100, $entry->totalDebit());
        $this->assertEquals(100, $entry->totalCredit());

        $result = \App\Services\AccountingService::verifyBalances($somiti->id);
        $this->assertTrue($result['balanced']);
    }

    public function test_member_cannot_create_penalty()
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('penalties.store'), [
            'somiti_id' => $somiti->id,
            'user_id' => $member->id,
            'amount' => 50,
        ])->assertStatus(403);
    }
}
