<?php

namespace Database\Factories;

use App\Models\Share;
use App\Models\Somiti;
use App\Models\FinancialYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Share>
 */
class ShareFactory extends Factory
{
    protected $model = Share::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'financial_year_id' => FinancialYear::factory(),
            'share_price' => $this->faker->randomFloat(2, 10, 1000),
            'total_shares' => $this->faker->numberBetween(1000, 100000),
        ];
    }
}
