<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '01700000001',
            'password' => 'password',
            'status' => 'active',
        ]);

        // Create some random users
        User::factory(20)->create();
    }
}
