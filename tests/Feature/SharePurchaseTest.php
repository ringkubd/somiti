<?php

namespace Tests\Feature;

use App\Models\UserShare;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SharePurchaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_buy_shares_and_manager_can_approve()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        Sanctum::actingAs($member, ['*']);

        $response = $this->postJson(route('shares.store'), [
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'share_count' => 10,
        ]);

        $response->assertStatus(201);

        $shareId = $response->json('id');

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('shares.approve', ['share' => $shareId]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('user_shares', ['id' => $shareId, 'status' => 'approved']);
        $this->assertDatabaseHas('approvals', ['approvable_id' => $shareId, 'approvable_type' => UserShare::class, 'status' => 'approved']);
    }
}
