<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Share extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'share_price',
        'total_shares',
    ];

    /**
     * Get current price for this share (alias)
     */
    public function currentPrice(): float
    {
        return (float) $this->share_price;
    }

    public function availableShares(): int
    {
        // naive implementation; in future consider reserved/issued
        return (int) $this->total_shares;
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function financialYear(): BelongsTo
    {
        return $this->belongsTo(FinancialYear::class);
    }
}
