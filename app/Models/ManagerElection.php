<?php

namespace App\Models;

use App\Services\ManagerService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class ManagerElection extends Model
{
    use \App\Traits\HasApprovals, \App\Traits\HasTenantScope, HasFactory, SoftDeletes;

    protected $table = 'somiti_manager_elections';

    protected $fillable = [
        'somiti_id',
        'candidate_user_id',
        'from_date',
        'to_date',
        'note',
        'status',
        'decided_at',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date' => 'date',
        'decided_at' => 'datetime',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'candidate_user_id');
    }

    /**
     * Majority decision: appoint the candidate as manager.
     */
    public function approve(int $voterId): bool
    {
        return DB::transaction(function () use ($voterId) {
            $this->status = 'approved';
            $this->decided_at = now();
            $saved = $this->save();

            if ($saved) {
                ManagerService::appoint(
                    $this->somiti,
                    $this->candidate_user_id,
                    $this->from_date->format('Y-m-d'),
                    $this->to_date?->format('Y-m-d'),
                    $this->note
                );
            }

            return $saved;
        });
    }

    public function reject(int $voterId, ?string $comment = null): bool
    {
        $this->status = 'rejected';
        $this->decided_at = now();

        return $this->save();
    }
}
