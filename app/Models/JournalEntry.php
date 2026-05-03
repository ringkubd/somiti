<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JournalEntry extends Model
{
    use \App\Traits\HasTenantScope;

    protected $table = 'journal_entries';

    protected $fillable = [
        'somiti_id',
        'reference_id',
        'reference_type',
        'entry_date',
        'description',
        'is_posted',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'is_posted' => 'boolean',
    ];

    /**
     * Journal entries are immutable — prevent updates.
     */
    protected static function booted(): void
    {
        static::updating(function (JournalEntry $entry) {
            throw new \RuntimeException('Journal entries cannot be modified.');
        });

        static::deleting(function (JournalEntry $entry) {
            throw new \RuntimeException('Journal entries cannot be deleted.');
        });
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function totalDebit(): float
    {
        return (float) $this->lines()->sum('debit');
    }

    public function totalCredit(): float
    {
        return (float) $this->lines()->sum('credit');
    }

    public function isBalanced(): bool
    {
        return abs($this->totalDebit() - $this->totalCredit()) < 0.005;
    }
}
