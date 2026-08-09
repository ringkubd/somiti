<?php

namespace Tests\Feature;

use App\Models\FinancialYear;
use App\Models\JournalEntry;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoanRepaymentTest extends TestCase
{
    use RefreshDatabase;

    private function setUpLoan(): array
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
            'status' => 'active',
            'is_active' => true,
        ]);

        $loan = Loan::create([
            'somiti_id' => $somiti->id,
            'financial_year_id' => $fy->id,
            'user_id' => $member->id,
            'amount' => 5000,
            'interest_rate' => 10,
            'interest_type' => 'flat',
            'term_months' => 10,
            'status' => 'pending',
        ]);

        return compact('owner', 'manager', 'member', 'somiti', 'loan');
    }

    public function test_member_creates_repayment_and_manager_approves_with_balanced_journal()
    {
        ['manager' => $manager, 'member' => $member, 'loan' => $loan] = $this->setUpLoan();

        // Approve and disburse the loan first
        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('loans.approve', ['loan' => $loan->id]))->assertStatus(200);
        $this->postJson(route('loans.disburse', ['loan' => $loan->id]))->assertStatus(200);

        $this->assertSame('disbursed', $loan->fresh()->status);
        $this->assertEquals(5000, (float) $loan->fresh()->outstanding_balance);

        // Member creates a repayment request
        Sanctum::actingAs($member, ['*']);

        $response = $this->postJson(route('loans.repayments.store', ['loan' => $loan->id]), [
            'amount' => 1000,
            'payment_date' => now()->toDateString(),
            'method' => 'cash',
            'notes' => 'First installment',
        ]);

        $response->assertStatus(201);

        $repayment = LoanRepayment::where('loan_id', $loan->id)->first();
        $this->assertNotNull($repayment);
        $this->assertSame('pending', $repayment->status);

        // Flat 10% on 5000 over 10 months → $50 interest per month
        $this->assertEquals(50, (float) $repayment->interest_portion);
        $this->assertEquals(950, (float) $repayment->principal_portion);

        // Manager approves
        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('repayments.approve', ['repayment' => $repayment->id]))->assertStatus(200);

        $this->assertSame('approved', $repayment->fresh()->status);

        // Outstanding balance reduced by principal portion only
        $this->assertEquals(4050, (float) $loan->fresh()->outstanding_balance);

        // Journal entry exists, is balanced, and debits cash / credits loans receivable
        $entry = JournalEntry::where('reference_type', LoanRepayment::class)
            ->where('reference_id', $repayment->id)
            ->first();

        $this->assertNotNull($entry);
        $this->assertTrue($entry->isBalanced());
        $this->assertEquals(1000, $entry->totalDebit());
        $this->assertEquals(1000, $entry->totalCredit());

        // Trial balance remains balanced
        $result = \App\Services\AccountingService::verifyBalances($loan->somiti_id);
        $this->assertTrue($result['balanced']);
    }

    public function test_repayment_cannot_exceed_outstanding_balance_plus_interest()
    {
        ['manager' => $manager, 'member' => $member, 'loan' => $loan] = $this->setUpLoan();

        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('loans.approve', ['loan' => $loan->id]))->assertStatus(200);
        $this->postJson(route('loans.disburse', ['loan' => $loan->id]))->assertStatus(200);

        Sanctum::actingAs($member, ['*']);

        $this->postJson(route('loans.repayments.store', ['loan' => $loan->id]), [
            'amount' => 6000,
        ])->assertStatus(422);

        $this->assertDatabaseCount('loan_repayments', 0);
    }

    public function test_member_cannot_repay_someone_elses_loan()
    {
        ['manager' => $manager, 'member' => $member, 'somiti' => $somiti, 'loan' => $loan] = $this->setUpLoan();

        $outsider = User::factory()->create();

        Sanctum::actingAs($manager, ['*']);
        $this->postJson(route('loans.approve', ['loan' => $loan->id]))->assertStatus(200);
        $this->postJson(route('loans.disburse', ['loan' => $loan->id]))->assertStatus(200);

        Sanctum::actingAs($outsider, ['*']);
        $this->postJson(route('loans.repayments.store', ['loan' => $loan->id]), [
            'amount' => 100,
        ])->assertStatus(403);
    }
}
