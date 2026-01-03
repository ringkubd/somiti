<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_assign_permission()
    {
        // create permission
        Permission::create(['name' => 'manage_notifications']);

        $admin = User::factory()->create();
        $user = User::factory()->create();

        // give admin manage_all directly
        Permission::create(['name' => 'manage_all']);
        $admin->givePermissionTo('manage_all');

        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson(route('users.assignPermission', ['user' => $user->id]), ['permission' => 'manage_notifications']);
        $response->assertStatus(200);

        $this->assertTrue($user->fresh()->hasPermission('manage_notifications'));
    }

    public function test_manager_can_assign_somiti_permission_to_member()
    {
        Permission::create(['name' => 'manage_somiti_members']);

        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->addMember($member);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('users.assignPermission', ['user' => $member->id]), ['permission' => 'manage_somiti_members']);
        $response->assertStatus(200);

        $this->assertTrue($member->fresh()->hasPermission('manage_somiti_members'));
    }

    public function test_non_admin_cannot_assign_global_permission()
    {
        Permission::create(['name' => 'manage_users']);

        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson(route('users.assignPermission', ['user' => $other->id]), ['permission' => 'manage_users']);
        $response->assertStatus(403);
    }
}
