<?php

namespace App\Observers;

use App\Models\SomitiManager;
use Carbon\Carbon;

class SomitiManagerObserver
{
    public function creating(SomitiManager $manager): void
    {
        // When a new manager is created, end any current manager for the same somiti
        $current = SomitiManager::where('somiti_id', $manager->somiti_id)
            ->whereNull('to_date')
            ->first();

        if ($current) {
            // set current manager's to_date as the day before new manager's from_date (if available)
            if ($manager->from_date) {
                $current->to_date = Carbon::parse($manager->from_date)->subDay()->format('Y-m-d');
            } else {
                $current->to_date = Carbon::now()->format('Y-m-d');
            }
            $current->save();
        }
    }
}
