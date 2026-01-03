<?php

namespace Database\Factories;

use App\Models\Ledger;
use App\Models\Somiti;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ledger>
 */
class LedgerFactory extends Factory
{
    protected $model = Ledger::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'reference_id' => null,
            'reference_type' => null,
            'debit' => $this->faker->randomFloat(2, 0, 10000),
            'credit' => 0,
            'description' => $this->faker->sentence(),
        ];
    }
}
