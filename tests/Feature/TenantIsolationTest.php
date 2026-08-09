<?php

namespace Tests\Feature;

use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_outsider_cannot_create_deposit_in_foreign_somiti()
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        Sanctum::actingAs($outsider, ['*']);

        $this->postJson(route('deposits.store'), [
            'somiti_id' => $somiti->id,
            'amount' => 100,
        ])->assertStatus(403);

        $this->assertDatabaseCount('deposits', 0);
    }

    public function test_member_cannot_create_bank_account_for_somiti()
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('bank-accounts.store'), [
            'somiti_id' => $somiti->id,
            'bank_name' => 'Sonali Bank',
            'account_number' => '123456',
            'account_type' => 'savings',
        ])->assertStatus(403);

        $this->assertDatabaseCount('bank_accounts', 0);
    }

    public function test_member_cannot_create_fdr_for_somiti()
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('fdrs.store'), [
            'somiti_id' => $somiti->id,
            'bank_name' => 'Agrani Bank',
            'interest_rate' => 8,
            'tenure_months' => 12,
        ])->assertStatus(403);

        $this->assertDatabaseCount('fdrs', 0);
    }
}
