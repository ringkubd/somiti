<?php

namespace Database\Factories;

use App\Models\Loan;
use App\Models\Somiti;
use App\Models\FinancialYear;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Loan>
 */
class LoanFactory extends Factory
{
    protected $model = Loan::class;

    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 1000, 50000);
        return [
            'somiti_id' => Somiti::factory(),
            'financial_year_id' => FinancialYear::factory(),
            'user_id' => User::factory(),
            'amount' => $amount,
            'interest_rate' => $this->faker->randomFloat(2, 0, 15),
            'interest_type' => $this->faker->randomElement(['flat', 'reducing']),
            'term_months' => $this->faker->numberBetween(6, 60),
            'outstanding_balance' => $amount,
            'purpose' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending','approved','disbursed','closed','rejected']),
            'approved_by' => null,
            'approved_at' => null,
            'due_date' => null,
        ];
    }
}
