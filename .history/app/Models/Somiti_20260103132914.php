<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Somiti extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'unique_code',
        'start_date',
        'financial_year_start',
        'status',
        'created_by_user_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'financial_year_start' => 'date',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(SomitiMember::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'somiti_members')
            ->withPivot(['role', 'is_active', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function managers(): HasMany
    {
        return $this->hasMany(SomitiManager::class);
    }

    public function financialYears(): HasMany
    {
        return $this->hasMany(FinancialYear::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(Share::class);
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(Ledger::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Helper methods

    public function addMember(User $user, string $role = 'member'): SomitiMember
    {
        return SomitiMember::create([
            'somiti_id' => $this->id,
            'user_id' => $user->id,
            'role' => $role,
            'is_active' => true,
            'joined_at' => now(),
        ]);
    }

    public function removeMember($user): bool
    {
        $userId = $user instanceof User ? $user->id : (int) $user;
        return SomitiMember::where('somiti_id', $this->id)->where('user_id', $userId)->delete() > 0;
    }

    public function activeFinancialYear(): ?FinancialYear
    {
        return $this->financialYears()->where('is_active', true)->first();
    }

    public function setActiveYear(FinancialYear $year): bool
    {
        if ($year->somiti_id !== $this->id) {
            throw new \InvalidArgumentException('Financial year does not belong to this somiti');
        }

        // use the observer logic but do it programmatically
        FinancialYear::where('somiti_id', $this->id)->update(['is_active' => false]);
        $year->is_active = true;
        return $year->save();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
