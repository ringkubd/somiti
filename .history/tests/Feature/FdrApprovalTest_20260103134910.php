<?php

namespace Tests\Feature;

use App\Models\Fdr;
use App\Models\Investment;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FdrApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_approve_fdr()
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
            'type' => 'bank-fdr',
            'amount' => 50000,
            'status' => 'approved',
        ]);

        $fdr = Fdr::create([
            'somiti_id' => $somiti->id,
            'investment_id' => $investment->id,
            'bank_name' => 'Bank A',
            'interest_rate' => 6.5,
            'tenure_months' => 12,
        ]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('fdrs.approve', ['fdr' => $fdr->id]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('fdrs', ['id' => $fdr->id, 'status' => 'approved']);
        $this->assertDatabaseHas('approvals', ['approvable_id' => $fdr->id, 'approvable_type' => Fdr::class, 'status' => 'approved']);
    }
}
