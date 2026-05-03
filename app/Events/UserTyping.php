<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $somitiId;
    public $userId;
    public $userName;

    public function __construct(int $somitiId, int $userId, string $userName)
    {
        $this->somitiId = $somitiId;
        $this->userId = $userId;
        $this->userName = $userName;
    }

    public function broadcastOn(): array
    {
        return [new PresenceChannel('somiti.' . $this->somitiId)];
    }

    public function broadcastAs(): string
    {
        return 'typing';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'user_name' => $this->userName,
        ];
    }
}
