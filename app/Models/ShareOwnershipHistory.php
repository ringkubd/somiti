<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ShareOwnershipHistory extends Model
{
    public $timestamps = false;

    protected $table = 'share_ownership_history';

    protected $fillable = [
        'somiti_id',
        'user_id',
        'share_transfer_id',
        'financial_year_id',
        'shares_before',
        'shares_after',
        'delta',
        'entry_type',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    const TYPE_PURCHASE = 'purchase';

    const TYPE_TRANSFER_IN = 'transfer_in';

    const TYPE_TRANSFER_OUT = 'transfer_out';

    const TYPE_ISSUANCE = 'issuance';

    const TYPE_REDEMPTION = 'redemption';

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shareTransfer(): BelongsTo
    {
        return $this->belongsTo(ShareTransfer::class);
    }

    public function financialYear(): BelongsTo
    {
        return $this->belongsTo(FinancialYear::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get ownership history for a user in a somiti, chronological.
     */
    public static function forUser(int $userId, int $somitiId)
    {
        return static::where('user_id', $userId)
            ->where('somiti_id', $somitiId)
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get a user's share balance at a specific point in time.
     */
    public static function balanceAt(int $userId, int $somitiId, ?string $date = null): int
    {
        $query = static::where('user_id', $userId)->where('somiti_id', $somitiId);

        if ($date) {
            $query->where('created_at', '<=', $date);
        }

        $last = $query->orderBy('created_at', 'desc')->first();

        return $last ? $last->shares_after : 0;
    }
}
