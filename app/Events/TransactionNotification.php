<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $somitiId;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
        $this->somitiId = $notification->somiti_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('somiti.' . $this->somitiId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'is_read' => false,
            'created_at' => $this->notification->created_at->toISOString(),
        ];
    }
}
