<?php

namespace Tests\Feature;

use App\Models\Loan;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoanApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_approve_and_disburse_loan()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);

        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        $loan = Loan::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'user_id' => $member->id,
            'amount' => 5000,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('loans.approve', ['loan' => $loan->id]), ['comments' => 'Approve']);
        $response->assertStatus(200);

        $this->assertDatabaseHas('loans', ['id' => $loan->id, 'status' => 'approved']);

        $response = $this->postJson(route('loans.disburse', ['loan' => $loan->id]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('loans', ['id' => $loan->id, 'status' => 'disbursed']);
        $this->assertNotNull(Loan::find($loan->id)->disbursed_at);
    }
}
