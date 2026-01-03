<?php

namespace Tests\Feature;

use App\Models\Approval;
use App\Models\Deposit;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DepositApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_approve_deposit()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);

        // attach roles/members
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $deposit = Deposit::create([
            'somiti_id' => $somiti->id,
            'user_id' => $member->id,
            'amount' => 1000,
            'status' => 'pending'
        ]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('deposits.approve', ['deposit' => $deposit->id]), ['comments' => 'Looks good']);

        $response->assertStatus(200);

        $this->assertDatabaseHas('deposits', ['id' => $deposit->id, 'status' => 'approved']);
        $this->assertDatabaseHas('approvals', ['approvable_id' => $deposit->id, 'approvable_type' => Deposit::class, 'decision' => 'approved']);
    }
}
