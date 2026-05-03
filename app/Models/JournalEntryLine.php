<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntryLine extends Model
{
    protected $table = 'journal_entry_lines';

    protected $fillable = [
        'journal_entry_id',
        'chart_of_account_id',
        'member_id',
        'debit',
        'credit',
        'description',
    ];

    protected $casts = [
        'debit' => 'decimal:2',
        'credit' => 'decimal:2',
    ];

    /**
     * Lines are immutable when part of a posted journal entry.
     */
    protected static function booted(): void
    {
        static::updating(function (JournalEntryLine $line) {
            if ($line->journalEntry && $line->journalEntry->is_posted) {
                throw new \RuntimeException('Posted journal entry lines cannot be modified.');
            }
        });

        static::deleting(function (JournalEntryLine $line) {
            if ($line->journalEntry && $line->journalEntry->is_posted) {
                throw new \RuntimeException('Posted journal entry lines cannot be deleted.');
            }
        });
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function chartOfAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
