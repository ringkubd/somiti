<?php

namespace Database\Factories;

use App\Models\SomitiMember;
use App\Models\User;
use App\Models\Somiti;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SomitiMember>
 */
class SomitiMemberFactory extends Factory
{
    protected $model = SomitiMember::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['member', 'manager', 'auditor']),
            'is_active' => true,
            'joined_at' => now(),
        ];
    }
}
