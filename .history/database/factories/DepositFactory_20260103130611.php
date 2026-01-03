<?php

namespace Database\Factories;

use App\Models\Deposit;
use App\Models\Somiti;
use App\Models\FinancialYear;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deposit>
 */
class DepositFactory extends Factory
{
    protected $model = Deposit::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'financial_year_id' => FinancialYear::factory(),
            'user_id' => User::factory(),
            'month' => $this->faker->monthName(),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'type' => $this->faker->randomElement(['monthly', 'dps']),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'approved_by' => null,
            'approved_at' => null,
        ];
    }
}
