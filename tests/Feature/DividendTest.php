<?php

namespace Tests\Feature;

use App\Models\DividendAllocation;
use App\Models\DividendDeclaration;
use App\Models\FinancialYear;
use App\Models\JournalEntry;
use App\Models\Somiti;
use App\Models\User;
use App\Models\UserShare;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DividendTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_declare_and_pay_dividend_with_balanced_journal()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();
        $member = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);
        $somiti->members()->create(['user_id' => $member->id, 'from_date' => now()]);

        $fy = FinancialYear::create([
            'somiti_id' => $somiti->id,
            'title' => 'FY 2026',
            'start_date' => now()->startOfYear(),
            'end_date' => now()->endOfYear(),
            'is_active' => true,
        ]);

        UserShare::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'user_id' => $member->id,
            'share_count' => 10,
            'status' => 'approved',
        ]);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('somitis.dividends.store', ['somiti' => $somiti->id]), [
            'total_amount' => 2000,
            'distribution_type' => 'share_based',
            'financial_year_id' => $fy->id,
            'dividend_rate' => 50,
            'profit_period' => 'H1 2026',
        ]);

        $response->assertStatus(201);

        $declaration = DividendDeclaration::where('somiti_id', $somiti->id)->first();
        $this->assertNotNull($declaration);
        $this->assertEquals(1000, (float) $declaration->total_dividend);
        $this->assertSame('pending', $declaration->status);

        $allocation = DividendAllocation::where('dividend_declaration_id', $declaration->id)->first();
        $this->assertNotNull($allocation);
        $this->assertEquals(10, $allocation->share_count);
        $this->assertEquals(1000, (float) $allocation->total_dividend);

        // Approve / pay
        $response = $this->postJson(route('dividends.approve', ['declaration' => $declaration->id]));
        $response->assertStatus(200);

        $this->assertSame('paid', $declaration->fresh()->status);
        $this->assertSame('paid', $allocation->fresh()->status);

        // Journal entries are balanced (Debit Interest Expense / Credit Cash per member)
        $entries = JournalEntry::where('reference_type', DividendDeclaration::class)
            ->where('reference_id', $declaration->id)
            ->get();

        $this->assertCount(1, $entries);
        $this->assertTrue($entries->first()->isBalanced());

        $result = \App\Services\AccountingService::verifyBalances($somiti->id);
        $this->assertTrue($result['balanced']);
    }

    public function test_member_cannot_declare_dividend()
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
        ]);

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('somitis.dividends.store', ['somiti' => $somiti->id]), [
            'total_amount' => 100,
            'financial_year_id' => $fy->id,
        ])->assertStatus(403);
    }
}
