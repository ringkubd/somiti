<?php

use App\Models\User;
use App\Models\Somiti;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $somiti = Somiti::factory()->create(['created_by_user_id' => $user->id]);
    $somiti->members()->create(['user_id' => $user->id]);

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
