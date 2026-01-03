<?php

namespace Tests\Feature;

use App\Models\FinancialYear;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinancialYearTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_activate_financial_year()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        $fy1 = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2025', 'start_date' => now()->subYear()->startOfYear(), 'end_date' => now()->subYear()->endOfYear(), 'status' => 'pending']);
        $fy2 = FinancialYear::create(['somiti_id' => $somiti->id, 'title' => 'FY 2026', 'start_date' => now()->startOfYear(), 'end_date' => now()->endOfYear(), 'status' => 'pending']);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('financial-years.activate', ['financial_year' => $fy2->id]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('financial_years', ['id' => $fy2->id, 'status' => 'active']);
    }
}
