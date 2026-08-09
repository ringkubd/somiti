<?php

namespace Tests\Feature;

use App\Models\FinancialYear;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreDataFixTest extends TestCase
{
    use RefreshDatabase;

    public function test_deposit_store_autofills_active_financial_year()
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create([
            'somiti_id' => $somiti->id,
            'title' => 'FY 2026',
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
        ]);

        Sanctum::actingAs($member, ['*']);

        $response = $this->postJson(route('deposits.store'), [
            'somiti_id' => $somiti->id,
            'amount' => 500,
        ]);

        $response->assertStatus(201);
        $this->assertEquals($fy->id, $response->json('financial_year_id'));
    }

    public function test_fdr_store_defaults_user_id_to_actor()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('fdrs.store'), [
            'somiti_id' => $somiti->id,
            'bank_name' => 'Sonali Bank',
            'interest_rate' => 8,
            'tenure_months' => 12,
            'maturity_amount' => 12000,
        ]);

        $response->assertStatus(201);
        $this->assertEquals($manager->id, $response->json('user_id'));
        $this->assertDatabaseHas('fdrs', [
            'id' => $response->json('id'),
            'user_id' => $manager->id,
        ]);
    }
}
