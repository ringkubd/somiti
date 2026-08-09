<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\PushToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public $notification;
    public $timeout = 30;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function handle(): void
    {
        $notification = $this->notification;

        $tokens = PushToken::query();

        if ($notification->user_id) {
            // Personal notification — send to that user only
            $tokens->where('user_id', $notification->user_id);
        } elseif ($notification->somiti_id) {
            // Somiti-wide notification — send to all active members
            $tokens->whereIn('user_id', function ($q) use ($notification) {
                $q->select('user_id')
                    ->from('somiti_members')
                    ->where('somiti_id', $notification->somiti_id)
                    ->where('is_active', true);
            });
        }

        $deviceTokens = $tokens->pluck('token')->unique()->values()->toArray();

        if (empty($deviceTokens)) {
            return;
        }

        foreach (array_chunk($deviceTokens, 100) as $chunk) {
            $messages = array_map(fn($token) => [
                'to' => $token,
                'sound' => 'default',
                'title' => $notification->title,
                'body' => mb_substr($notification->message, 0, 200),
                'priority' => 'high',
                'data' => [
                    'notification_id' => $notification->id,
                    'somiti_id' => $notification->somiti_id,
                    'type' => 'transaction',
                ],
            ], $chunk);

            try {
                Http::withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', $messages);
            } catch (\Throwable $e) {
                \Log::warning('Expo push failed: ' . $e->getMessage());
            }
        }
    }
}
