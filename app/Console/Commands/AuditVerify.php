<?php

namespace App\Console\Commands;

use App\Models\Deposit;
use App\Models\Fdr;
use App\Models\Investment;
use App\Models\JournalEntry;
use App\Models\Loan;
use App\Models\ShareTransfer;
use App\Models\TransactionEvent;
use App\Models\UserShare;
use Illuminate\Console\Command;

class AuditVerify extends Command
{
    protected $signature = 'audit:verify {somiti_id : The somiti ID to verify}';

    protected $description = 'Verify audit trail integrity for a somiti.';

    public function handle(): int
    {
        $somitiId = (int) $this->argument('somiti_id');

        $this->info("Verifying audit integrity for Somiti #{$somitiId}...\n");

        $issues = [];

        // 1. Check every approved transaction has a corresponding event
        $this->checkApprovedWithoutEvents($somitiId, $issues);

        // 2. Check every journal entry has an event
        $this->checkJournalsWithoutEvents($somitiId, $issues);

        // 3. Check share transfers have events
        $this->checkTransfersWithoutEvents($somitiId, $issues);

        // 4. Summarize event counts
        $totalEvents = TransactionEvent::where('somiti_id', $somitiId)->count();
        $eventTypes = TransactionEvent::where('somiti_id', $somitiId)
            ->selectRaw('event_type, count(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type')
            ->toArray();

        $this->info("Total events: {$totalEvents}");
        foreach ($eventTypes as $type => $count) {
            $this->line("  {$type}: {$count}");
        }

        if (empty($issues)) {
            $this->info("\n Audit trail is clean — no integrity issues found.");
        } else {
            $this->warn("\n Found ".count($issues).' integrity issues:');
            foreach ($issues as $issue) {
                $this->error("  - {$issue}");
            }
        }

        return empty($issues) ? self::SUCCESS : self::FAILURE;
    }

    private function checkApprovedWithoutEvents(int $somitiId, array &$issues): void
    {
        $models = [
            ['class' => Deposit::class, 'name' => 'Deposit'],
            ['class' => Loan::class, 'name' => 'Loan'],
            ['class' => Investment::class, 'name' => 'Investment'],
            ['class' => Fdr::class, 'name' => 'Fdr'],
            ['class' => UserShare::class, 'name' => 'UserShare'],
        ];

        foreach ($models as $model) {
            $approved = $model['class']::where('somiti_id', $somitiId)
                ->where('status', 'approved')
                ->get();

            foreach ($approved as $record) {
                $hasEvent = TransactionEvent::where('entity_type', $model['class'])
                    ->where('entity_id', $record->id)
                    ->where('event_type', TransactionEvent::EVENT_APPROVED)
                    ->exists();

                if (! $hasEvent) {
                    $issues[] = "{$model['name']} #{$record->id}: approved but no APPROVED event";
                }
            }
        }
    }

    private function checkJournalsWithoutEvents(int $somitiId, array &$issues): void
    {
        $journals = JournalEntry::where('somiti_id', $somitiId)->get();

        foreach ($journals as $entry) {
            $hasEvent = TransactionEvent::where('entity_type', JournalEntry::class)
                ->where('entity_id', $entry->id)
                ->exists();

            if (! $hasEvent) {
                $issues[] = "JournalEntry #{$entry->id}: exists but no creation event";
            }
        }
    }

    private function checkTransfersWithoutEvents(int $somitiId, array &$issues): void
    {
        $transfers = ShareTransfer::where('somiti_id', $somitiId)->get();

        foreach ($transfers as $transfer) {
            $hasEvent = TransactionEvent::where('entity_type', ShareTransfer::class)
                ->where('entity_id', $transfer->id)
                ->exists();

            if (! $hasEvent) {
                $issues[] = "ShareTransfer #{$transfer->id}: exists but no event";
            }
        }
    }
}
