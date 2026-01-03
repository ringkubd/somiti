<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ledger extends Model
{
    use HasFactory;

    protected $fillable = [
        'somiti_id',
        'reference_id',
        'reference_type',
        'debit',
        'credit',
        'description',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Helper to create a ledger entry idempotently
     */
    public static function createUnique(array $attributes)
    {
        $query = static::query()
            ->where('reference_type', $attributes['reference_type'])
            ->where('reference_id', $attributes['reference_id'])
            ->where('somiti_id', $attributes['somiti_id']);

        if (!empty($attributes['credit'])) {
            $query->where('credit', $attributes['credit']);
        }

        if (!empty($attributes['debit'])) {
            $query->where('debit', $attributes['debit']);
        }

        if ($query->exists()) {
            return $query->first();
        }

        return static::create($attributes);
    }
}
