<?php

namespace Tests\Feature;

use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_view_and_update_member_profile()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create(['name' => 'Member']);

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->addMember($member);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->getJson(route('users.show', ['user' => $member->id]));
        $response->assertStatus(200);

        $response = $this->putJson(route('users.update', ['user' => $member->id]), ['name' => 'Changed']);
        $response->assertStatus(200);

        $this->assertDatabaseHas('users', ['id' => $member->id, 'name' => 'Changed']);
    }

    public function test_non_manager_cannot_update_other_user()
    {
        $user = User::factory()->create();
        $other = User::factory()->create(['name' => 'Other']);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson(route('users.update', ['user' => $other->id]), ['name' => 'Bad']);
        $response->assertStatus(403);
    }
}
