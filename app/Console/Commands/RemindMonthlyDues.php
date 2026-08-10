<?php

namespace App\Console\Commands;

use App\Models\DueReminder;
use App\Models\Notification;
use App\Models\Somiti;
use App\Services\DuesService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class RemindMonthlyDues extends Command
{
    protected $signature = 'dues:remind';

    protected $description = 'Send monthly deposit due/overdue reminders to members';

    public function handle(): int
    {
        $sent = 0;
        $now = now();
        $monthKey = $now->format('Y-m');

        $somitis = Somiti::whereNotNull('monthly_deposit_amount')
            ->where('monthly_deposit_amount', '>', 0)
            ->whereNotNull('due_day')
            ->get();

        foreach ($somitis as $somiti) {
            $dueDate = Carbon::create($now->year, $now->month, (int) $somiti->due_day)->endOfDay();
            $graceEnd = $dueDate->copy()->addDays((int) ($somiti->loan_grace_days ?? 0));

            $type = null;
            if ($now->between($dueDate->copy()->subDay()->startOfDay(), $graceEnd)) {
                $type = 'due';
            } elseif ($now->gt($graceEnd)) {
                $type = 'overdue';
            }

            if (! $type) {
                continue;
            }

            $unpaid = DuesService::unpaidMembers($somiti, $monthKey);
            $amount = (float) $somiti->monthly_deposit_amount;
            $monthLabel = $now->format('F Y');

            foreach ($unpaid as $member) {
                $already = DueReminder::where('somiti_id', $somiti->id)
                    ->where('user_id', $member->user_id)
                    ->where('month_key', $monthKey)
                    ->where('type', $type)
                    ->exists();

                if ($already) {
                    continue;
                }

                $title = $type === 'overdue'
                    ? 'Monthly deposit overdue'
                    : 'Monthly deposit due';

                $message = $type === 'overdue'
                    ? "Your {$monthLabel} deposit of {$somiti->currency_symbol}{$amount} is overdue. Please pay as soon as possible."
                    : "Your {$monthLabel} deposit of {$somiti->currency_symbol}{$amount} is due by {$dueDate->format('d M Y')}. Please pay.";

                Notification::sendToUser($member->user, $title, $message, $somiti);

                DueReminder::create([
                    'somiti_id' => $somiti->id,
                    'user_id' => $member->user_id,
                    'month_key' => $monthKey,
                    'type' => $type,
                ]);
                $sent++;
            }
        }

        $this->info("Sent {$sent} due reminders.");

        return self::SUCCESS;
    }
}
