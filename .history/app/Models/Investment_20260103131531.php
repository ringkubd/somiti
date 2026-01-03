<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Investment extends Model
{
    use HasFactory, SoftDeletes, \App\Traits\HasApprovals;

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'type',
        'amount',
        'start_date',
        'maturity_date',
        'expected_return',
        'status',
        'approved_by',
        'approved_at',
    ];

    /**
     * Approve this investment and create an approval record.
     */
    public function approve(int $approverId): bool
    {
        $this->status = 'approved';
        $this->approved_by = $approverId;
        $this->approved_at = now();
        $saved = $this->save();

        $this->approvals()->create([
            'user_id' => $approverId,
            'status' => 'approved',
            'decided_at' => now(),
        ]);

        return $saved;
    }

    public function reject(int $approverId, ?string $comment = null): bool
    {
        $this->status = 'rejected';
        $this->approved_by = $approverId;
        $this->approved_at = now();
        $saved = $this->save();

        $this->approvals()->create([
            'user_id' => $approverId,
            'status' => 'rejected',
            'comment' => $comment,
            'decided_at' => now(),
        ]);

        return $saved;
    }

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'maturity_date' => 'date',
        'expected_return' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function financialYear(): BelongsTo
    {
        return $this->belongsTo(FinancialYear::class);
    }

    public function fdrs(): HasMany
    {
        return $this->hasMany(Fdr::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(Ledger::class, 'reference_id')->where('reference_type', Investment::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
