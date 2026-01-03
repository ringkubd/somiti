<?php

namespace Tests\Feature;

use App\Models\Share;
use App\Models\Somiti;
use App\Models\User;
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

        $response = $this->postJson(route('share-types.store'), ['somiti_id' => $somiti->id, 'name' => 'Ordinary', 'price' => 100]);
        $response->assertStatus(201);

        $shareId = $response->json('id');

        $response = $this->putJson(route('share-types.update', ['share_type' => $shareId]), ['price' => 120]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('shares', ['id' => $shareId, 'price' => '120.00']);
    }
}
