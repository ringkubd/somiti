<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $perms = [
            ['name' => 'manage_all', 'description' => 'Full access to manage the system'],
            ['name' => 'manage_users', 'description' => 'Manage user profiles'],
            ['name' => 'manage_notifications', 'description' => 'Manage notifications'],
            ['name' => 'manage_somiti_members', 'description' => 'Manage somiti members'],
        ];

        foreach ($perms as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }
    }
}
