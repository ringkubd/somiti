<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // Relations (some are already defined elsewhere but helpful to have here)

    public function somitiMembers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SomitiMember::class);
    }

    public function somitis(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Somiti::class, 'somiti_members')
            ->withPivot(['role', 'is_active', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function deposits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function loans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function investments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function approvals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Approval::class);
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function managerAssignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SomitiManager::class);
    }

    // Helper methods

    public function isManagerOfSomiti($somiti): bool
    {
        $somitiId = $somiti instanceof Somiti ? $somiti->id : (int) $somiti;

        // Check current manager table first
        $current = $this->managerAssignments()->where('somiti_id', $somitiId)->whereNull('to_date')->exists();
        if ($current) {
            return true;
        }

        // Fallback to somiti_members table with role=manager and active
        return $this->somitiMembers()->where('somiti_id', $somitiId)->where('role', 'manager')->where('is_active', true)->exists();
    }

    public function totalShares($somiti): int
    {
        $somitiId = $somiti instanceof Somiti ? $somiti->id : (int) $somiti;

        return UserShare::where('user_id', $this->id)->where('somiti_id', $somitiId)->sum('share_count');
    }

    public function pendingApprovals()
    {
        return $this->approvals()->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
