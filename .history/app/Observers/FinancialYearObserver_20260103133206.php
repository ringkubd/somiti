<?php

namespace App\Observers;

use App\Models\FinancialYear;

class FinancialYearObserver
{
    public function creating(FinancialYear $fy): void
    {
        if ($fy->is_active) {
            // deactivate others for the same somiti
            FinancialYear::where('somiti_id', $fy->somiti_id)->update(['is_active' => false]);
        }
    }

    public function updating(FinancialYear $fy): void
    {
        if ($fy->isDirty('is_active') && $fy->is_active) {
            // deactivate other years
            FinancialYear::where('somiti_id', $fy->somiti_id)
                ->where('id', '!=', $fy->id)
                ->update(['is_active' => false]);
        }
    }
}
