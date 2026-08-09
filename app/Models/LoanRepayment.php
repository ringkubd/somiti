<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class LoanRepayment extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'loan_id',
        'somiti_id',
        'user_id',
        'amount',
        'principal_portion',
        'interest_portion',
        'payment_date',
        'method',
        'notes',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'principal_portion' => 'decimal:2',
        'interest_portion' => 'decimal:2',
        'payment_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Approve this repayment. Financial mutations are handled by the observer
     * so journal entries stay idempotent.
     */
    public function approve(int $approverId): bool
    {
        return DB::transaction(function () use ($approverId) {
            $this->status = 'approved';
            $this->approved_by = $approverId;
            $this->approved_at = now();

            return $this->save();
        });
    }

    public function reject(int $approverId): bool
    {
        return DB::transaction(function () use ($approverId) {
            $this->status = 'rejected';
            $this->approved_by = $approverId;
            $this->approved_at = now();

            return $this->save();
        });
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
