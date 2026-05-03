<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DividendDeclaration extends Model
{
    use \App\Traits\HasTenantScope;

    protected $table = 'dividend_declarations';

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'total_profit',
        'profit_period',
        'dividend_rate',
        'total_dividend',
        'status',
        'declared_by',
        'declared_at',
        'paid_at',
    ];

    protected $casts = [
        'declared_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function financialYear(): BelongsTo
    {
        return $this->belongsTo(FinancialYear::class);
    }

    public function declaredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'declared_by');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(DividendAllocation::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}
