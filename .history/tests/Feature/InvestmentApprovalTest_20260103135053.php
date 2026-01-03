<?php

namespace Tests\Feature;

use App\Models\Investment;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvestmentApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_approve_investment()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        $investment = Investment::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'user_id' => $owner->id,
            'type' => 'term-deposit',
            'amount' => 10000,
            'start_date' => now()->toDateString(),
            'maturity_date' => now()->addMonths(6)->toDateString(),
            'status' => 'pending',
        ]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('investments.approve', ['investment' => $investment->id]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('investments', ['id' => $investment->id, 'status' => 'approved']);
        $this->assertDatabaseHas('approvals', ['approvable_id' => $investment->id, 'approvable_type' => Investment::class, 'status' => 'approved']);
    }
}
