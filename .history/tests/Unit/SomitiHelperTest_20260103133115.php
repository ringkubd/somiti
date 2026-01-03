<?php

namespace Tests\Unit;

use App\Models\FinancialYear;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SomitiHelperTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_and_remove_member()
    {
        $user = User::factory()->create();
        $somiti = Somiti::factory()->create(['created_by_user_id' => $user->id]);

        $member = $somiti->addMember($user, 'member');

        $this->assertDatabaseHas('somiti_members', ['somiti_id' => $somiti->id, 'user_id' => $user->id]);

        $this->assertTrue($somiti->removeMember($user));
        $this->assertDatabaseMissing('somiti_members', ['somiti_id' => $somiti->id, 'user_id' => $user->id]);
    }

    public function test_set_active_financial_year()
    {
        $somiti = Somiti::factory()->create();

        $fy1 = FinancialYear::factory()->create(['somiti_id' => $somiti->id, 'is_active' => false]);
        $fy2 = FinancialYear::factory()->create(['somiti_id' => $somiti->id, 'is_active' => false]);

        $somiti->setActiveYear($fy2);

        $this->assertTrue($fy2->fresh()->is_active);
        $this->assertFalse($fy1->fresh()->is_active);
    }
}
