<?php

namespace Tests\Feature;

use App\Models\Approval;
use App\Models\Deposit;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApprovalListTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_list_pending_approvals()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        $deposit = Deposit::create(['somiti_id' => $somiti->id, 'financial_year_id' => $fy->id, 'user_id' => $member->id, 'amount' => 100, 'status' => 'pending']);

        // create a pending approval entry for deposit (assign to manager for now)
        Approval::create(['approvable_id' => $deposit->id, 'approvable_type' => Deposit::class, 'user_id' => $manager->id, 'status' => 'pending']);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->getJson(route('approvals.index'));
        $response->assertStatus(200);
        $response->assertJsonFragment(['approvable_type' => Deposit::class]);
    }
}
