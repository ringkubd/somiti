<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use App\Models\Somiti;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'somiti_id' => Somiti::factory(),
            'notifiable_id' => User::factory(),
            'notifiable_type' => User::class,
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->paragraph(),
            'is_read' => false,
        ];
    }
}
