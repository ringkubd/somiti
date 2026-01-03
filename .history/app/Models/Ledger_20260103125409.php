<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ledger extends Model
{
    use HasFactory;

    protected $fillable = [
        'somiti_id',
        'reference_id',
        'reference_type',
        'debit',
        'credit',
        'description',
    ];

    public function somiti(): BelongsTo
    {
        return $this->belongsTo(Somiti::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
