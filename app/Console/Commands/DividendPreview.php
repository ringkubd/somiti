<?php

namespace App\Console\Commands;

use App\Models\FinancialYear;
use App\Services\DividendService;
use Illuminate\Console\Command;

class DividendPreview extends Command
{
    protected $signature = 'dividend:preview
        {somiti_id : The somiti ID}
        {financial_year_id : The financial year ID}
        {--profit= : Total profit amount}
        {--rate=80 : Dividend rate percentage}';

    protected $description = 'Preview dividend distribution for a financial year.';

    public function handle(): int
    {
        $somitiId = (int) $this->argument('somiti_id');
        $fyId = (int) $this->argument('financial_year_id');
        $profit = (float) ($this->option('profit') ?? DividendService::calculateProfit($somitiId, $fyId));
        $rate = (float) $this->option('rate');

        $fy = FinancialYear::find($fyId);
        if (! $fy) {
            $this->error("Financial year #{$fyId} not found.");

            return self::FAILURE;
        }

        $this->info("Dividend Preview for {$fy->title}");
        $this->line("Total Profit: \${$profit}");
        $this->line("Dividend Rate: {$rate}%");

        $preview = DividendService::previewDividend($somitiId, $fyId, $profit, $rate);

        $this->newLine();
        $this->table(
            ['Member', 'Shares', 'Per Share', 'Total'],
            collect($preview['members'])->map(fn($m) => [
                $m['user_name'],
                $m['share_count'],
                '$' . number_format($m['dividend_per_share'], 2),
                '$' . number_format($m['total_dividend'], 2),
            ])->toArray()
        );

        $this->newLine();
        $this->line("Total Dividend: \${$preview['total_dividend']}");
        $this->line("Total Shares: {$preview['total_shares']}");

        return self::SUCCESS;
    }
}
