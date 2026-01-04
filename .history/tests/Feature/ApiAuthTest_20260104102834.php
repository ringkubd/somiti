<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_get_token_and_access_protected_route()
    {
        $user = User::factory()->create(['phone' => '01700000002', 'password' => 'password']);

        $response = $this->postJson(route('auth.login'), ['phone' => '01700000002', 'password' => 'password']);
        $response->assertStatus(200);
        $token = $response->json('token');
        $this->assertNotEmpty($token);

        // access protected route
        $resp2 = $this->withHeader('Authorization', "Bearer {$token}")->getJson(route('auth.me'));
        $resp2->assertStatus(200);
        $this->assertEquals($user->id, $resp2->json('id'));
    }

    public function test_invalid_credentials_fail()
    {
        $user = User::factory()->create(['phone' => '01700000003', 'password' => 'password']);

        $response = $this->postJson(route('auth.login'), ['phone' => '01700000003', 'password' => 'wrong']);
        $response->assertStatus(401);
    }

    public function test_logout_revokes_token()
    {
        $user = User::factory()->create(['phone' => '01700000004', 'password' => 'password']);

        $response = $this->postJson(route('auth.login'), ['phone' => '01700000004', 'password' => 'password']);
        $token = $response->json('token');

        $resp2 = $this->withHeader('Authorization', "Bearer {$token}")->postJson(route('auth.logout'));
        $resp2->assertStatus(200);

        $resp3 = $this->withHeader('Authorization', "Bearer {$token}")->getJson(route('auth.me'));
        $resp3->assertStatus(401);
    }
}
