<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_and_update_own_profile()
    {
        $user = User::factory()->create(['name' => 'Old']);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson(route('users.show', ['user' => $user->id]));
        $response->assertStatus(200);

        $response = $this->putJson(route('users.update', ['user' => $user->id]), ['name' => 'New']);
        $response->assertStatus(200);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New']);
    }

    public function test_user_cannot_view_or_update_other_user()
    {
        $user = User::factory()->create();
        $other = User::factory()->create(['name' => 'Other']);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson(route('users.show', ['user' => $other->id]));
        $response->assertStatus(403);

        $response = $this->putJson(route('users.update', ['user' => $other->id]), ['name' => 'Bad']);
        $response->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $other->id, 'name' => 'Other']);
    }
}
