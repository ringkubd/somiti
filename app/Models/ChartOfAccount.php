<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChartOfAccount extends Model
{
    use \App\Traits\HasTenantScope;

    protected $table = 'chart_of_accounts';

    protected $fillable = [
        'somiti_id',
        'code',
        'name',
        'type',
        'normal_balance',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public const TYPE_ASSET = 'asset';

    public const TYPE_LIABILITY = 'liability';

    public const TYPE_EQUITY = 'equity';

    public const TYPE_INCOME = 'income';

    public const TYPE_EXPENSE = 'expense';

    public const NORMAL_DEBIT = 'debit';

    public const NORMAL_CREDIT = 'credit';

    /**
     * Standard account codes seeded per somiti.
     */
    public const CODE_CASH = '1001';

    public const CODE_MEMBER_SAVINGS = '2001';

    public const CODE_SHARE_CAPITAL = '3001';

    public const CODE_LOANS_RECEIVABLE = '1002';

    public const CODE_INVESTMENTS = '1003';

    public const CODE_FDR_ASSET = '1004';

    public const CODE_INCOME_INTEREST = '4001';

    public const CODE_EXPENSE_INTEREST = '5001';

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function journalEntryLines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
