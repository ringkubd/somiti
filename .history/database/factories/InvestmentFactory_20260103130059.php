<?php

namespace Database\Factories;

use App\Models\Investment;
use App\Models\Somiti;
use App\Models\FinancialYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Investment>
 */
class InvestmentFactory extends Factory
{
    protected $model = Investment::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'financial_year_id' => FinancialYear::factory(),
            'type' => $this->faker->randomElement(['business','fdr','stock','other']),
            'amount' => $this->faker->randomFloat(2, 1000, 500000),
            'start_date' => $this->faker->dateTimeThisDecade()->format('Y-m-d'),
            'maturity_date' => null,
            'expected_return' => $this->faker->randomFloat(2, 0, 10000),
            'status' => $this->faker->randomElement(['pending','approved','completed','rejected']),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }
}
