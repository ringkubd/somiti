<?php

namespace Tests\Unit;

use App\Models\Somiti;
use App\Models\SomitiManager;
use App\Models\SomitiMember;
use App\Models\User;
use App\Models\UserShare;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_manager_of_somiti_via_manager_assignment()
    {
        $user = User::factory()->create();
        $somiti = Somiti::factory()->create(['created_by_user_id' => $user->id]);

        SomitiManager::factory()->create([
            'somiti_id' => $somiti->id,
            'user_id' => $user->id,
        ]);

        $this->assertTrue($user->isManagerOfSomiti($somiti));
    }

    public function test_total_shares_calculation()
    {
        $user = User::factory()->create();
        $somiti = Somiti::factory()->create(['created_by_user_id' => $user->id]);

        UserShare::factory()->create(['user_id' => $user->id, 'somiti_id' => $somiti->id, 'share_count' => 5]);
        UserShare::factory()->create(['user_id' => $user->id, 'somiti_id' => $somiti->id, 'share_count' => 3]);

        $this->assertEquals(8, $user->totalShares($somiti));
    }

    public function test_pending_approvals_scope()
    {
        $user = User::factory()->create();

        $user->approvals()->create(['status' => 'pending']);
        $user->approvals()->create(['status' => 'approved']);

        $this->assertEquals(1, $user->pendingApprovals()->count());
    }

    public function test_scope_active()
    {
        User::factory()->create(['status' => 'active']);
        User::factory()->create(['status' => 'pending']);

        $this->assertEquals(1, User::active()->count());
    }
}
