<?php

namespace Tests\Unit;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\Share;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShareObserverTest extends TestCase
{
    use RefreshDatabase;

    public function test_share_price_change_creates_ledger_entry_credit_on_gain()
    {
        $share = Share::factory()->create(['share_price' => 10.00, 'total_shares' => 100]);

        $share->update(['share_price' => 12.00]);

        // Should create a balanced journal entry (2 * 100 = 200)
        $this->assertDatabaseHas('journal_entries', [
            'reference_type' => Share::class,
            'reference_id' => $share->id,
        ]);

        $entry = JournalEntry::where('reference_type', Share::class)
            ->where('reference_id', $share->id)
            ->first();

        $this->assertNotNull($entry);
        $this->assertTrue($entry->isBalanced());

        // Total across both lines should reflect the gain (200 credit, 200 debit = balanced)
        $this->assertEquals(200.00, $entry->totalDebit());
        $this->assertEquals(200.00, $entry->totalCredit());
    }

    public function test_share_price_change_creates_ledger_entry_debit_on_loss()
    {
        $share = Share::factory()->create(['share_price' => 20.00, 'total_shares' => 50]);

        $share->update(['share_price' => 18.00]);

        // Should create a balanced journal entry ((20-18)=2 *50 = 100)
        $this->assertDatabaseHas('journal_entries', [
            'reference_type' => Share::class,
            'reference_id' => $share->id,
        ]);

        $entry = JournalEntry::where('reference_type', Share::class)
            ->where('reference_id', $share->id)
            ->first();

        $this->assertNotNull($entry);
        $this->assertTrue($entry->isBalanced());

        $this->assertEquals(100.00, $entry->totalDebit());
        $this->assertEquals(100.00, $entry->totalCredit());
    }
}
