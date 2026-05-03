<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccount extends Model
{
    use \App\Traits\HasTenantScope;

    protected $table = 'bank_accounts';

    protected $fillable = [
        'somiti_id',
        'bank_name',
        'branch_name',
        'account_number',
        'account_name',
        'account_type',
        'opening_balance',
        'current_balance',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }
}
