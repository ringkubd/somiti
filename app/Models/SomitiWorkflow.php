<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SomitiWorkflow extends Model
{
    use \App\Traits\HasTenantScope;

    protected $table = 'somiti_workflows';

    protected $fillable = [
        'somiti_id',
        'transaction_type',
        'requires_approval',
        'manager_can_approve_alone',
        'min_approvals_required',
        'quorum_type',
    ];

    protected $casts = [
        'requires_approval' => 'boolean',
        'manager_can_approve_alone' => 'boolean',
        'quorum_type' => 'string',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public static function getForType(int $somitiId, string $type): self
    {
        return static::firstOrCreate(
            ['somiti_id' => $somitiId, 'transaction_type' => $type],
            ['requires_approval' => true, 'manager_can_approve_alone' => true, 'min_approvals_required' => 1, 'quorum_type' => 'count']
        );
    }
}
