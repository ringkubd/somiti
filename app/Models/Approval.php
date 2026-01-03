<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Approval extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'approvable_id',
        'approvable_type',
        'user_id',
        'status',
        'comment',
        'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes & helpers

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForApprovable($query, $id, $type)
    {
        return $query->where('approvable_id', $id)->where('approvable_type', $type);
    }

    public function approve(): bool
    {
        $this->status = 'approved';
        $this->decided_at = $this->decided_at ?? now();
        return $this->save();
    }

    public function reject(?string $comment = null): bool
    {
        $this->status = 'rejected';
        $this->comment = $comment ?? $this->comment;
        $this->decided_at = $this->decided_at ?? now();
        return $this->save();
    }
}
