<?php

namespace App\Console\Commands;

use App\Services\ManagerService;
use Illuminate\Console\Command;

class ExpireManagers extends Command
{
    protected $signature = 'managers:expire';

    protected $description = 'End manager tenures whose to_date has passed and revert roles';

    public function handle(): int
    {
        $count = ManagerService::expireExpired();
        $this->info("Expired {$count} manager tenures.");

        return self::SUCCESS;
    }
}
