<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class UserAccessScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     * Fails closed — unknown models get empty results.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (app()->runningInConsole() || ! auth()->check()) {
            return;
        }

        $user = auth()->user();

        if ($user->role === 'super_admin') {
            return;
        }

        if ($model instanceof \App\Models\Somiti) {
            $builder->where(function ($query) use ($user) {
                $query->where('created_by_user_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            });

            return;
        }

        // Models with a 'somiti' relationship
        if (method_exists($model, 'somiti')) {
            $builder->whereHas('somiti', function ($query) use ($user) {
                $query->where('created_by_user_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            });

            return;
        }

        // Unknown model — fail closed (return no results)
        $builder->whereRaw('1 = 0');
    }
}
