<?php

namespace Tests\Unit;

use App\Models\Ledger;
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

        // 2 * 100 = 200 credit expected
        $this->assertDatabaseHas('ledgers', [
            'reference_type' => Share::class,
            'reference_id' => $share->id,
            'credit' => '200.00',
        ]);
    }

    public function test_share_price_change_creates_ledger_entry_debit_on_loss()
    {
        $share = Share::factory()->create(['share_price' => 20.00, 'total_shares' => 50]);

        $share->update(['share_price' => 18.00]);

        // (20-18)=2 *50 = 100 debit
        $this->assertDatabaseHas('ledgers', [
            'reference_type' => Share::class,
            'reference_id' => $share->id,
            'debit' => '100.00',
        ]);
    }
}
