<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $table = 'notification_preferences';

    protected $fillable = [
        'somiti_id',
        'type',
        'push_enabled',
        'email_enabled',
    ];

    protected $casts = [
        'push_enabled' => 'boolean',
        'email_enabled' => 'boolean',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public static function isEnabled(int $somitiId, string $type): bool
    {
        $pref = static::where('somiti_id', $somitiId)->where('type', $type)->first();
        return $pref ? $pref->push_enabled : true;
    }

    public static function getDefaults(): array
    {
        return [
            'deposit_created', 'deposit_approved', 'deposit_rejected',
            'loan_created', 'loan_approved', 'loan_disbursed', 'loan_rejected',
            'investment_created', 'investment_approved',
            'fdr_created', 'fdr_approved',
            'share_allocated', 'share_approved',
            'share_transfer_created', 'share_transfer_approved',
        ];
    }
}
