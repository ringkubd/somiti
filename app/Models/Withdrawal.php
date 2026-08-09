<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Withdrawal extends Model
{
    use \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'user_id',
        'amount',
        'reason',
        'method',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

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
