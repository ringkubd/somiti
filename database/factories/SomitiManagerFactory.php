<?php

namespace Database\Factories;

use App\Models\SomitiManager;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SomitiManager>
 */
class SomitiManagerFactory extends Factory
{
    protected $model = SomitiManager::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'user_id' => User::factory(),
            'from_date' => now()->subMonths(rand(0, 24))->format('Y-m-d'),
            'to_date' => null,
            'note' => null,
        ];
    }
}
