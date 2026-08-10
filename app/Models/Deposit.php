<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Deposit extends Model
{
    use \App\Traits\HasApprovals, \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'user_id',
        'month',
        'due_month',
        'amount',
        'type',
        'status',
        'approved_by',
        'approved_at',
    ];

    /**
     * Approve this deposit on behalf of a user. Triggers observers to create ledger.
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
                [
                    'status' => 'approved',
                    'decided_at' => now(),
                ]
            );

            return $saved;
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
                [
                    'status' => 'rejected',
                    'comment' => $comment,
                    'decided_at' => now(),
                ]
            );

            return $saved;
        });
    }

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'due_month' => 'date',
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
