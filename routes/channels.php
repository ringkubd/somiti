<?php

use App\Models\Somiti;
use App\Models\SomitiMember;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * Presence channel for somiti group chat.
 * Only active members can join.
 * Returns user info visible to other members.
 */
Broadcast::channel('somiti.{somitiId}', function ($user, $somitiId) {
    $somiti = Somiti::find($somitiId);
    if (! $somiti) {
        return false;
    }

    $isMember = SomitiMember::where('somiti_id', $somitiId)
        ->where('user_id', $user->id)
        ->where('is_active', true)
        ->exists();

    if (! $isMember && $somiti->created_by_user_id !== $user->id) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});
