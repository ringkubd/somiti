<?php

namespace Tests\Feature;

use App\Models\Share;
use App\Models\Somiti;
use App\Models\User;
use App\Models\FinancialYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShareManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_and_update_share_price()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        Sanctum::actingAs($manager, ['*']);

        $fy = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'active']);

        $response = $this->postJson(route('share-types.store'), ['somiti_id' => $somiti->id, 'financial_year_id' => $fy->id, 'share_price' => 100, 'total_shares' => 1000]);
        $response->assertStatus(201);

        $shareId = $response->json('id');

        // sanity checks
        $this->assertTrue($manager->isManagerOfSomiti($somiti->id));
        $this->assertDatabaseHas('shares', ['id' => $shareId, 'somiti_id' => $somiti->id]);

        $response = $this->putJson(route('share-types.update', ['share_type' => $shareId]), ['price' => 120]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('shares', ['id' => $shareId, 'share_price' => '120.00']);
    }
}
