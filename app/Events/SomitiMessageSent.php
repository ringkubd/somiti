<?php

namespace App\Events;

use App\Models\SomitiMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SomitiMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SomitiMessage $message;

    public function __construct(SomitiMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Broadcast on a presence channel unique to the somiti.
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('somiti.' . $this->message->somiti_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Data sent with the broadcast.
     */
    public function broadcastWith(): array
    {
        $message = $this->message->load('user:id,name');

        return [
            'id' => $message->id,
            'somiti_id' => $message->somiti_id,
            'user' => [
                'id' => $message->user->id,
                'name' => $message->user->name,
            ],
            'message' => $message->message,
            'message_type' => $message->message_type,
            'attachment_url' => $message->attachment_url,
            'created_at' => $message->created_at->toISOString(),
        ];
    }
}
