<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Loan extends Model
{
    use \App\Traits\HasApprovals, \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

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

    /**
     * Approve the loan (mark approved). Observers will create ledger entries as appropriate.
     */
    public function approve(int $approverId): bool
    {
        return DB::transaction(function () use ($approverId) {
            $this->status = 'approved';
            $this->approved_by = $approverId;
            $this->approved_at = now();
            $saved = $this->save();

            $this->approvals()->updateOrCreate(
                ['user_id' => $approverId],
                ['status' => 'approved', 'decided_at' => now()]
            );

            return $saved;
        });
    }

    /**
     * Mark loan as disbursed (separate lifecycle step).
     */
    public function disburse(): bool
    {
        return DB::transaction(function () {
            $this->status = 'disbursed';

            return $this->save();
        });
    }

    public function reject(int $approverId, ?string $comment = null): bool
    {
        return DB::transaction(function () use ($approverId, $comment) {
            $this->status = 'rejected';
            $this->approved_by = $approverId;
            $this->approved_at = now();
            $saved = $this->save();

            $this->approvals()->updateOrCreate(
                ['user_id' => $approverId],
                ['status' => 'rejected', 'comment' => $comment, 'decided_at' => now()]
            );

            return $saved;
        });
    }

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

    public function financialYear(): BelongsTo
    {
        return $this->belongsTo(FinancialYear::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function ledgers(): MorphMany
    {
        return $this->morphMany(Ledger::class, 'reference');
    }

    public function repayments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
