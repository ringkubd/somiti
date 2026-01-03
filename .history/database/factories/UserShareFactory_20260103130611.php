<?php

namespace Database\Factories;

use App\Models\UserShare;
use App\Models\User;
use App\Models\Somiti;
use App\Models\FinancialYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserShare>
 */
class UserShareFactory extends Factory
{
    protected $model = UserShare::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'somiti_id' => Somiti::factory(),
            'financial_year_id' => FinancialYear::factory(),
            'share_count' => $this->faker->numberBetween(1, 100),
        ];
    }
}
