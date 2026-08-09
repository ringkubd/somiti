<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\PushToken;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SendPushNotifications extends Command
{
    protected $signature = 'push:send {--notification-id= : Send to a specific notification}';
    protected $description = 'Send pending push notifications via Expo Push API';

    public function handle(): int
    {
        $notificationId = $this->option('notification-id');

        $query = Notification::where('is_read', false);

        if ($notificationId) {
            $query->where('id', $notificationId);
        }

        $notifications = $query->limit(50)->get();

        if ($notifications->isEmpty()) {
            $this->info('No pending notifications.');

            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($notifications as $notification) {
            // Find users who should receive this
            $tokens = PushToken::query();

            if ($notification->user_id) {
                // Personal notification
                $tokens->where('user_id', $notification->user_id);
            } elseif ($notification->somiti_id) {
                // Somiti-wide notification — send to all members with tokens
                $tokens->whereIn('user_id', function ($q) use ($notification) {
                    $q->select('user_id')
                        ->from('somiti_members')
                        ->where('somiti_id', $notification->somiti_id)
                        ->where('is_active', true);
                });
            }

            $deviceTokens = $tokens->pluck('token')->unique()->values()->toArray();

            if (empty($deviceTokens)) {
                continue;
            }

            // Send via Expo Push API (batched — max 100 per request)
            foreach (array_chunk($deviceTokens, 100) as $chunk) {
                $messages = array_map(fn($token) => [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => $notification->title,
                    'body' => mb_substr($notification->message, 0, 200),
                    'data' => [
                        'notification_id' => $notification->id,
                        'somiti_id' => $notification->somiti_id,
                    ],
                ], $chunk);

                try {
                    $response = Http::withHeaders([
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                    ])->post('https://exp.host/--/api/v2/push/send', $messages);

                    if ($response->successful()) {
                        $sent += count($chunk);
                    }
                } catch (\Throwable $e) {
                    $this->warn("Expo API error: {$e->getMessage()}");
                }
            }
        }

        $this->info("Sent {$sent} push notifications.");

        return self::SUCCESS;
    }
}
