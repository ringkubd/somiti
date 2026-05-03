<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class LedgerMigrateToJournal extends Command
{
    protected $signature = 'ledger:migrate-to-journal';

    protected $description = 'Migrate old ledger entries to double-entry journal format.';

    public function handle(): int
    {
        $oldEntries = \App\Models\Ledger::withTrashed()->get();

        if ($oldEntries->isEmpty()) {
            $this->info('No old ledger entries to migrate.');

            return self::SUCCESS;
        }

        $this->info("Found {$oldEntries->count()} old ledger entries. Starting migration...");

        $migrated = 0;
        $skipped = 0;

        foreach ($oldEntries as $ledger) {
            // Check if already migrated
            $exists = \App\Models\JournalEntry::where('reference_type', $ledger->reference_type)
                ->where('reference_id', $ledger->reference_id)
                ->where('somiti_id', $ledger->somiti_id)
                ->exists();

            if ($exists) {
                $skipped++;

                continue;
            }

            try {
                \Illuminate\Support\Facades\DB::transaction(function () use ($ledger) {
                    $entry = \App\Models\JournalEntry::create([
                        'somiti_id' => $ledger->somiti_id,
                        'reference_id' => $ledger->reference_id,
                        'reference_type' => $ledger->reference_type,
                        'entry_date' => $ledger->created_at->format('Y-m-d'),
                        'description' => $ledger->description ?? 'Migrated from legacy ledger #'.$ledger->id,
                    ]);

                    // Old system: single-sided entries (either debit OR credit)
                    // We create balanced double-entry lines using contra accounts
                    $amount = max((float) $ledger->debit, (float) $ledger->credit);
                    $isDebit = (float) $ledger->debit > 0;

                    if ($isDebit) {
                        $contraCode = $this->inferContraAccount($ledger->reference_type, 'debit');
                    } else {
                        $contraCode = $this->inferContraAccount($ledger->reference_type, 'credit');
                    }

                    $mainAccount = $this->getMainAccountForReference($ledger->reference_type);
                    $contraAccount = \App\Models\ChartOfAccount::where('somiti_id', $ledger->somiti_id)
                        ->where('code', $contraCode)
                        ->first();

                    if (! $contraAccount) {
                        // Fallback: create balanced entry using same account
                        $contraAccount = \App\Models\ChartOfAccount::where('somiti_id', $ledger->somiti_id)
                            ->where('code', $mainAccount)
                            ->first();
                    }

                    if (! $contraAccount) {
                        throw new \RuntimeException("No contra account found for {$contraCode} in somiti {$ledger->somiti_id}");
                    }

                    // Main account line
                    \App\Models\JournalEntryLine::create([
                        'journal_entry_id' => $entry->id,
                        'chart_of_account_id' => \App\Models\ChartOfAccount::where('somiti_id', $ledger->somiti_id)
                            ->where('code', $mainAccount)->firstOrFail()->id,
                        'debit' => $ledger->debit,
                        'credit' => $ledger->credit,
                        'description' => $ledger->description ?? 'Migrated entry',
                    ]);

                    // Contra account line (balances the entry)
                    \App\Models\JournalEntryLine::create([
                        'journal_entry_id' => $entry->id,
                        'chart_of_account_id' => $contraAccount->id,
                        'debit' => $ledger->credit, // opposite side
                        'credit' => $ledger->debit, // opposite side
                        'description' => 'Contra entry (migrated)',
                    ]);
                });

                $migrated++;
            } catch (\Throwable $e) {
                $this->error("Failed to migrate ledger #{$ledger->id}: {$e->getMessage()}");
            }
        }

        $this->info("Migration complete. Migrated: {$migrated}, Skipped: {$skipped}");

        return self::SUCCESS;
    }

    private function getMainAccountForReference(string $referenceType): string
    {
        return match ($referenceType) {
            'App\\Models\\Deposit' => \App\Models\ChartOfAccount::CODE_MEMBER_SAVINGS,
            'App\\Models\\Loan' => \App\Models\ChartOfAccount::CODE_LOANS_RECEIVABLE,
            'App\\Models\\Investment' => \App\Models\ChartOfAccount::CODE_INVESTMENTS,
            'App\\Models\\Fdr' => \App\Models\ChartOfAccount::CODE_FDR_ASSET,
            'App\\Models\\UserShare', 'App\\Models\\ShareTransfer' => \App\Models\ChartOfAccount::CODE_SHARE_CAPITAL,
            default => \App\Models\ChartOfAccount::CODE_CASH,
        };
    }

    private function inferContraAccount(string $referenceType, string $side): string
    {
        return match ($referenceType) {
            'App\\Models\\Deposit' => \App\Models\ChartOfAccount::CODE_CASH,
            'App\\Models\\Loan' => \App\Models\ChartOfAccount::CODE_CASH,
            'App\\Models\\Investment' => \App\Models\ChartOfAccount::CODE_CASH,
            'App\\Models\\Fdr' => \App\Models\ChartOfAccount::CODE_CASH,
            'App\\Models\\UserShare', 'App\\Models\\ShareTransfer' => \App\Models\ChartOfAccount::CODE_CASH,
            default => \App\Models\ChartOfAccount::CODE_CASH,
        };
    }
}
