<?php

use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Models\User;

test('tenant scope does not recurse when building nested subqueries', function () {
    $user = User::factory()->create();
    Somiti::factory()->create(['created_by_user_id' => $user->id]);

    // Force the HTTP (non-console) code path so the scope is applied,
    // even though the test suite itself runs from the CLI.
    $app = app();
    $prop = new ReflectionProperty($app, 'isRunningInConsole');
    $prop->setAccessible(true);
    $prop->setValue($app, false);

    try {
        $this->actingAs($user);

        // Building SQL triggers the global scope at each nesting level;
        // without the re-entrancy guard this would recurse until OOM.
        $somitiSql = Somiti::query()->toSql();
        expect($somitiSql)->toContain('created_by_user_id');

        $memberSql = SomitiMember::query()->toSql();
        expect($memberSql)->toContain('somitis');
    } finally {
        $prop->setValue($app, true);
    }
});
