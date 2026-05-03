<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialYear extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'title',
        'start_date',
        'end_date',
        'is_active',
        'share_value',
        'is_closed',
        'closed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'bool',
        'is_closed' => 'bool',
        'closed_at' => 'datetime',
    ];

    /**
     * Close this financial year — lock it and record closure time.
     */
    public function close(): void
    {
        if ($this->is_closed) {
            throw new \RuntimeException("Financial year '{$this->title}' is already closed.");
        }

        \App\Services\DividendService::closeFinancialYear($this);
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(Share::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }
}
