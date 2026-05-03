<?php

namespace App\Traits;

use App\Models\Scopes\UserAccessScope;

trait HasTenantScope
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function bootHasTenantScope()
    {
        static::addGlobalScope(new UserAccessScope);
    }
}
