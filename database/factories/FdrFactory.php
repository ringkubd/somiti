<?php

namespace Database\Factories;

use App\Models\Fdr;
use App\Models\Investment;
use App\Models\Somiti;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fdr>
 */
class FdrFactory extends Factory
{
    protected $model = Fdr::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'investment_id' => Investment::factory(),
            'bank_name' => $this->faker->company(),
            'interest_rate' => $this->faker->randomFloat(2, 1, 15),
            'tenure_months' => $this->faker->numberBetween(6, 60),
            'maturity_amount' => $this->faker->randomFloat(2, 1000, 100000),
        ];
    }
}
