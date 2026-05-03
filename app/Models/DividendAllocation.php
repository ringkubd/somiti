<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DividendAllocation extends Model
{
    protected $table = 'dividend_allocations';

    protected $fillable = [
        'dividend_declaration_id',
        'user_id',
        'share_count',
        'dividend_per_share',
        'total_dividend',
        'status',
        'journal_entry_id',
    ];

    protected $casts = [
        'dividend_per_share' => 'decimal:2',
        'total_dividend' => 'decimal:2',
    ];

    public function declaration(): BelongsTo
    {
        return $this->belongsTo(DividendDeclaration::class, 'dividend_declaration_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }
}
