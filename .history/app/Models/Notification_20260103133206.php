<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'somiti_id',
        'notifiable_id',
        'notifiable_type',
        'user_id',
        'title',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'bool',
    ];

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helpers

    public function markRead(): bool
    {
        $this->is_read = true;
        return $this->save();
    }

    public static function sendToUser(User $user, string $title, string $message, ?Somiti $somiti = null): self
    {
        return static::create([
            'somiti_id' => $somiti?->id,
            'notifiable_id' => $user->id,
            'notifiable_type' => User::class,
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }

    public static function sendToSomiti(Somiti $somiti, string $title, string $message): self
    {
        // create a notification record for the somiti (not tied to an individual user)
        return static::create([
            'somiti_id' => $somiti->id,
            'notifiable_id' => $somiti->id,
            'notifiable_type' => Somiti::class,
            'user_id' => null,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
