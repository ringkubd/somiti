<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SomitiMessage extends Model
{
    const UPDATED_AT = null;

    protected $table = 'somiti_messages';

    protected $fillable = [
        'somiti_id',
        'user_id',
        'message',
        'message_type',
        'attachment_url',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Messages are immutable — no updates, no deletes.
     */
    protected static function booted(): void
    {
        static::updating(function () {
            throw new \RuntimeException('Messages cannot be modified.');
        });

        static::deleting(function () {
            throw new \RuntimeException('Messages cannot be deleted.');
        });
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
