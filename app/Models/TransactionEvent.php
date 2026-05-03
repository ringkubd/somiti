<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionEvent extends Model
{
    public $timestamps = false;

    protected $table = 'transaction_events';

    protected $fillable = [
        'somiti_id',
        'user_id',
        'event_type',
        'entity_type',
        'entity_id',
        'payload',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    // Event type constants
    const EVENT_CREATED = 'created';

    const EVENT_UPDATED = 'updated';

    const EVENT_APPROVED = 'approved';

    const EVENT_REJECTED = 'rejected';

    const EVENT_DISBURSED = 'disbursed';

    const EVENT_TRANSFERRED = 'transferred';

    /**
     * Prevent updates — immutable log.
     */
    protected static function booted(): void
    {
        static::updating(function () {
            throw new \RuntimeException('Transaction events are immutable.');
        });

        static::deleting(function () {
            throw new \RuntimeException('Transaction events cannot be deleted.');
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

    /**
     * Record an event idempotently.
     */
    public static function record(
        int $somitiId,
        ?int $userId,
        string $eventType,
        string $entityType,
        int $entityId,
        ?array $payload = null,
        ?string $ipAddress = null
    ): self {
        return static::create([
            'somiti_id' => $somitiId,
            'user_id' => $userId,
            'event_type' => $eventType,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => $payload,
            'ip_address' => $ipAddress ?? request()->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Fetch audit trail for a specific entity.
     */
    public static function forEntity(string $entityType, int $entityId)
    {
        return static::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Fetch audit trail for a somiti, optionally filtered.
     */
    public static function forSomiti(int $somitiId, ?string $eventType = null, ?int $limit = 100)
    {
        $query = static::where('somiti_id', $somitiId)
            ->orderBy('created_at', 'desc');

        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        return $query->limit($limit)->get();
    }
}
