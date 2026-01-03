<?php

namespace Tests\Feature;

use App\Models\Deposit;
use App\Models\Ledger;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LedgerIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_view_ledgers_after_approval()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        $deposit = Deposit::create(['somiti_id' => $somiti->id, 'financial_year_id' => $fy->id, 'user_id' => $member->id, 'amount' => 1000, 'status' => 'pending']);

        // manager approves (this should create ledger entries via observer)
        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('deposits.approve', ['deposit' => $deposit->id]), ['comments' => 'ok'])->assertStatus(200);

        $response = $this->getJson(route('ledgers.index', ['somiti_id' => $somiti->id]));
        $response->assertStatus(200);
        $response->assertJsonFragment(['somiti_id' => $somiti->id]);
    }
}
