<?php

namespace Database\Factories;

use App\Models\Somiti;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Somiti>
 */
class SomitiFactory extends Factory
{
    protected $model = Somiti::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'unique_code' => strtoupper($this->faker->bothify('SOMITI-###')),
            'start_date' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            'financial_year_start' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            'status' => 'active',
            'created_by_user_id' => User::factory(),
        ];
    }
}
