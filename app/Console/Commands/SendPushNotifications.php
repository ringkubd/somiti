<?php

namespace App\Console\Commands;

use App\Jobs\SendPushNotification;
use App\Models\Notification;
use App\Services\FcmService;
use Illuminate\Console\Command;

class SendPushNotifications extends Command
{
    protected $signature = 'push:send {--notification-id= : Send to a specific notification}';

    protected $description = 'Send pending push notifications via Firebase Cloud Messaging';

    public function handle(): int
    {
        if (! FcmService::isConfigured()) {
            $this->warn('FCM is not configured (FIREBASE_CREDENTIALS missing).');

            return self::FAILURE;
        }

        $query = Notification::where('is_read', false);

        if ($this->option('notification-id')) {
            $query->where('id', $this->option('notification-id'));
        }

        $notifications = $query->limit(50)->get();
        $sent = 0;

        foreach ($notifications as $notification) {
            $sent += SendPushNotification::deliver($notification);
        }

        $this->info("Sent {$sent} push notifications via FCM.");

        return self::SUCCESS;
    }
}
