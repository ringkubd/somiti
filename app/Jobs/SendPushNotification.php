<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\PushToken;
use App\Services\FcmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $notification;
    public $timeout = 60;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function handle(): void
    {
        static::deliver($this->notification);
    }

    /**
     * Send a notification to the right devices via FCM.
     * Personal notifications → the owner's devices.
     * Somiti-wide notifications → OFFLINE members' devices only
     * (online = active within the last 2 minutes).
     *
     * @return int number of messages sent
     */
    public static function deliver(Notification $notification): int
    {
        if (! FcmService::isConfigured()) {
            return 0;
        }

        $data = [
            'notification_id' => (string) $notification->id,
            'somiti_id' => (string) ($notification->somiti_id ?? ''),
            'type' => (string) ($notification->data['type'] ?? 'transaction'),
            'id' => (string) ($notification->data['id'] ?? ''),
        ];

        $sent = 0;
        foreach (static::recipientTokens($notification) as $row) {
            $status = FcmService::send($row->token, $notification->title, $notification->message, $data);

            if ($status === 'ok') {
                $sent++;
            } elseif ($status === 'unregistered') {
                $row->delete();
            }
        }

        return $sent;
    }

    /**
     * Select which device tokens should receive a notification.
     */
    public static function recipientTokens(Notification $notification)
    {
        $tokens = PushToken::query();

        if ($notification->user_id) {
            $tokens->where('user_id', $notification->user_id);
        } elseif ($notification->somiti_id) {
            $tokens->whereIn('user_id', function ($q) use ($notification) {
                $q->select('user_id')
                    ->from('somiti_members')
                    ->where('somiti_id', $notification->somiti_id)
                    ->where('is_active', true);
            })
                ->whereHas('user', fn ($q) => $q
                    ->where(fn ($q2) => $q2->whereNull('last_active_at')->orWhere('last_active_at', '<', now()->subMinutes(2))));
        } else {
            return collect();
        }

        return $tokens->get();
    }
}
