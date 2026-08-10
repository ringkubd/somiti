<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('push:send')->everyMinute()->withoutOverlapping();
Schedule::command('dues:remind')->dailyAt('09:00')->withoutOverlapping();
Schedule::command('managers:expire')->dailyAt('00:30')->withoutOverlapping();
