<?php

use App\Jobs\SendPushNotification;
use App\Models\FinancialYear;
use App\Models\Notification;
use App\Models\PushToken;
use App\Models\Somiti;
use App\Models\User;

test('somiti-wide push targets only offline members', function () {
    $owner = User::factory()->create();
    $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
    $somiti->addMember($owner, 'owner');
    FinancialYear::factory()->create(['somiti_id' => $somiti->id, 'is_active' => true]);

    $online = User::factory()->create();
    $offline = User::factory()->create();
    $somiti->addMember($online, 'member');
    $somiti->addMember($offline, 'member');

    $online->forceFill(['last_active_at' => now()])->save();
    $offline->forceFill(['last_active_at' => now()->subMinutes(10)])->save();

    PushToken::create(['user_id' => $online->id, 'token' => 'token-online', 'platform' => 'android']);
    PushToken::create(['user_id' => $offline->id, 'token' => 'token-offline', 'platform' => 'android']);

    $notification = Notification::create([
        'somiti_id' => $somiti->id,
        'notifiable_id' => $somiti->id,
        'notifiable_type' => Somiti::class,
        'user_id' => null,
        'title' => 'New message',
        'message' => 'Hello',
    ]);

    $tokens = SendPushNotification::recipientTokens($notification)->pluck('token')->values();

    expect($tokens)->toContain('token-offline')->not->toContain('token-online');
});

test('personal push reaches the user even when online', function () {
    $user = User::factory()->create();
    $user->forceFill(['last_active_at' => now()])->save();
    PushToken::create(['user_id' => $user->id, 'token' => 'personal-token', 'platform' => 'ios']);
    $somiti = Somiti::factory()->create(['created_by_user_id' => $user->id]);

    $notification = Notification::create([
        'somiti_id' => $somiti->id,
        'notifiable_id' => $user->id,
        'notifiable_type' => User::class,
        'user_id' => $user->id,
        'title' => 'Deposit Approved',
        'message' => 'Done',
    ]);

    $tokens = SendPushNotification::recipientTokens($notification)->pluck('token');

    expect($tokens)->toContain('personal-token');
});
