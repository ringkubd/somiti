<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ShareTransfer extends Model
{
    /** @use HasFactory<\Database\Factories\ShareTransferFactory> */
    use \App\Traits\HasApprovals, \App\Traits\HasTenantScope, HasFactory;

    protected $fillable = [
        'somiti_id',
        'financial_year_id',
        'from_user_id',
        'to_user_id',
        'quantity',
        'price_per_share',
        'transfer_date',
        'status',
        'notes',
    ];

    public function somiti()
    {
        return $this->belongsTo(Somiti::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function approve(int $approverId): bool
    {
        return DB::transaction(function () use ($approverId) {
            $this->status = 'approved';
            $saved = $this->save();

            if ($saved) {
                \App\Services\ShareService::executeTransfer($this);
            }

            $this->approvals()->updateOrCreate(
                ['user_id' => $approverId],
                ['status' => 'approved', 'decided_at' => now()]
            );

            return $saved;
        });
    }

    public function reject(int $approverId, ?string $comment = null): bool
    {
        return DB::transaction(function () use ($approverId, $comment) {
            $this->status = 'rejected';
            $saved = $this->save();

            $this->approvals()->updateOrCreate(
                ['user_id' => $approverId],
                ['status' => 'rejected', 'comment' => $comment, 'decided_at' => now()]
            );

            return $saved;
        });
    }
}
