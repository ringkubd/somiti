<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Fdr extends Model
{
    use \App\Traits\HasApprovals, \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'investment_id',
        'bank_name',
        'interest_rate',
        'tenure_months',
        'maturity_amount',
    ];

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

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }
}
