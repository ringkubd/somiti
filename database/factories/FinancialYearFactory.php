<?php

namespace Database\Factories;

use App\Models\FinancialYear;
use App\Models\Somiti;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FinancialYear>
 */
class FinancialYearFactory extends Factory
{
    protected $model = FinancialYear::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-2 years', 'now');
        $end = (clone $start)->modify('+1 year');

        return [
            'somiti_id' => Somiti::factory(),
            'title' => $start->format('Y') . '-' . $end->format('y'),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'is_active' => false,
        ];
    }
}
