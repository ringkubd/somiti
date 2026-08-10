<?php

namespace App\Services;

use App\Models\Somiti;
use App\Models\SomitiManager;
use App\Models\SomitiMember;
use App\Models\User;

class ManagerService
{
    /**
     * Appoint a manager for a tenure. The observer ends the previous current manager.
     */
    public static function appoint(Somiti $somiti, int $userId, string $fromDate, ?string $toDate = null, ?string $note = null): SomitiManager
    {
        $manager = SomitiManager::create([
            'somiti_id' => $somiti->id,
            'user_id' => $userId,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'note' => $note,
        ]);

        // Ensure member record exists and is marked manager
        SomitiMember::updateOrCreate(
            ['somiti_id' => $somiti->id, 'user_id' => $userId],
            ['role' => 'manager', 'is_active' => true, 'joined_at' => now()]
        );

        return $manager->fresh(['user']);
    }

    /**
     * End a manager's tenure (now) and revert their member role if appropriate.
     */
    public static function end(SomitiManager $manager): SomitiManager
    {
        $manager->to_date = $manager->to_date ?? now()->format('Y-m-d');
        $manager->save();

        static::revertRoleIfNoActiveTenure($manager->somiti_id, $manager->user_id);

        return $manager->fresh(['user']);
    }

    /**
     * Daily sweep: expire managers whose to_date has passed.
     */
    public static function expireExpired(): int
    {
        $expired = SomitiManager::whereNotNull('to_date')->where('to_date', '<', now()->startOfDay())->get();
        $count = 0;

        foreach ($expired as $manager) {
            static::revertRoleIfNoActiveTenure($manager->somiti_id, $manager->user_id);
            $count++;
        }

        return $count;
    }

    public static function revertRoleIfNoActiveTenure(int $somitiId, int $userId): void
    {
        $hasActive = SomitiManager::where('somiti_id', $somitiId)
            ->where('user_id', $userId)
            ->where(fn ($q) => $q->whereNull('to_date')->orWhere('to_date', '>', now()->endOfDay()))
            ->exists();

        if ($hasActive) {
            return;
        }

        $member = SomitiMember::where('somiti_id', $somitiId)->where('user_id', $userId)->first();
        if ($member && $member->role !== 'owner') {
            $member->role = 'member';
            $member->save();
        }
    }

    public static function canManage(Somiti $somiti, User $user): bool
    {
        return $user->isOwnerOfSomiti($somiti->id) || $user->isManagerOfSomiti($somiti->id);
    }
}
