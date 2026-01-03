<?php

namespace Tests\Feature;

use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SomitiMembershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_add_and_remove_members()
    {
        $owner = User::factory()->create();
        $user = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);

        Sanctum::actingAs($owner, ['*']);

        $response = $this->postJson(route('somitis.users.store', ['somiti' => $somiti->id]), ['user_id' => $user->id, 'role' => 'member']);
        $response->assertStatus(201);

        $this->assertDatabaseHas('somiti_members', ['somiti_id' => $somiti->id, 'user_id' => $user->id]);

        $response = $this->deleteJson(route('somitis.users.destroy', ['somiti' => $somiti->id, 'user' => $user->id]));
        $response->assertStatus(200);

        $this->assertSoftDeleted('somiti_members', ['somiti_id' => $somiti->id, 'user_id' => $user->id]);
    }

    public function test_manager_can_add_and_update_member()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $user = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('somitis.users.store', ['somiti' => $somiti->id]), ['user_id' => $user->id, 'role' => 'member']);
        $response->assertStatus(201);

        $response = $this->putJson(route('somitis.users.update', ['somiti' => $somiti->id, 'user' => $user->id]), ['role' => 'treasurer']);
        $response->assertStatus(200);

        $this->assertDatabaseHas('somiti_members', ['somiti_id' => $somiti->id, 'user_id' => $user->id, 'role' => 'treasurer']);
    }

    public function test_non_manager_cannot_manage_members()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);

        Sanctum::actingAs($other, ['*']);

        $response = $this->postJson(route('somitis.users.store', ['somiti' => $somiti->id]), ['user_id' => $other->id]);
        $response->assertStatus(403);
    }
}
