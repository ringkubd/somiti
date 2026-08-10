<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DueReminder extends Model
{
    protected $fillable = [
        'somiti_id',
        'user_id',
        'month_key',
        'type',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
