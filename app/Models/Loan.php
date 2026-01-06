<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Loan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'user_id',
        'amount',
        'interest_rate',
        'interest_type',
        'term_months',
        'outstanding_balance',
        'purpose',
        'status',
        'approved_by',
        'approved_at',
        'due_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'outstanding_balance' => 'decimal:2',
        'approved_at' => 'datetime',
        'due_date' => 'date',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntry(): MorphOne
    {
        return $this->morphOne(Ledger::class, 'reference');
    }
}
