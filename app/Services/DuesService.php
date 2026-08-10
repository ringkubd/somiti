<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DuesService
{
    /**
     * First-of-month keys (YYYY-MM) between two dates, inclusive.
     */
    public static function monthKeysBetween(Carbon $from, Carbon $to): array
    {
        $from = $from->copy()->startOfMonth();
        $to = $to->copy()->startOfMonth();
        $keys = [];

        while ($from->lte($to)) {
            $keys[] = $from->format('Y-m');
            $from->addMonth();
        }

        return $keys;
    }

    /**
     * Approved deposits for a member, keyed by YYYY-MM (due_month or created_at).
     */
    public static function paidByMonth(Somiti $somiti, int $userId): Collection
    {
        return Deposit::where('somiti_id', $somiti->id)
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->get()
            ->groupBy(fn (Deposit $d) => $d->due_month
                ? $d->due_month->format('Y-m')
                : $d->created_at->format('Y-m'));
    }

    /**
     * Pending (unapproved) deposits for a member, keyed by YYYY-MM.
     */
    public static function pendingByMonth(Somiti $somiti, int $userId): Collection
    {
        return Deposit::where('somiti_id', $somiti->id)
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->get()
            ->groupBy(fn (Deposit $d) => $d->due_month
                ? $d->due_month->format('Y-m')
                : $d->created_at->format('Y-m'));
    }

    /**
     * First month a member is expected to deposit.
     */
    public static function scheduleStart(SomitiMember $member, Somiti $somiti): Carbon
    {
        $start = $member->joined_at ?? $somiti->start_date ?? now();

        return Carbon::parse($start)->startOfMonth();
    }

    /**
     * One member's monthly schedule through the current month.
     *
     * @return array{user: User, months: array<int, array<string,mixed>>, total_expected: float, total_paid: float, pending: float, due_count: int, overdue_count: int}
     */
    public static function memberSchedule(Somiti $somiti, SomitiMember $member): array
    {
        $expected = (float) ($somiti->monthly_deposit_amount ?? 0);
        $dueDay = (int) ($somiti->due_day ?? 10);
        $graceDays = (int) ($somiti->loan_grace_days ?? 0);
        $now = now();

        $keys = static::monthKeysBetween(static::scheduleStart($member, $somiti), $now);
        $paid = static::paidByMonth($somiti, $member->user_id);
        $pending = static::pendingByMonth($somiti, $member->user_id);

        $months = [];
        $totalExpected = 0.0;
        $totalPaid = 0.0;
        $totalPending = 0.0;
        $dueCount = 0;
        $overdueCount = 0;

        foreach ($keys as $key) {
            [$year, $monthNum] = array_map('intval', explode('-', $key));
            $paidAmount = (float) $paid->get($key)?->sum('amount') ?? 0;
            $pendingAmount = (float) $pending->get($key)?->sum('amount') ?? 0;
            $depositIds = $paid->get($key)?->pluck('id')->values()->all() ?? [];

            $status = 'future';
            if ($expected > 0) {
                if ($paidAmount >= $expected) {
                    $status = 'paid';
                } elseif ($paidAmount > 0) {
                    $status = 'partial';
                } else {
                    $monthDate = Carbon::create($year, $monthNum, 1);
                    $isCurrentMonth = $monthDate->format('Y-m') === $now->format('Y-m');
                    $dueDate = Carbon::create($year, $monthNum, $dueDay)->endOfDay()->addDays($graceDays);
                    $status = ($isCurrentMonth && $now->lte($dueDate)) || $monthDate->gt($now)
                        ? 'due'
                        : 'overdue';
                }
            }

            if ($status === 'due') {
                $dueCount++;
            }
            if ($status === 'overdue') {
                $overdueCount++;
            }

            $totalExpected += $expected;
            $totalPaid += $paidAmount;
            $totalPending += $pendingAmount;

            $months[] = [
                'month_key' => $key,
                'month_label' => Carbon::create($year, $monthNum, 1)->format('F Y'),
                'expected' => $expected,
                'paid' => $paidAmount,
                'pending' => $pendingAmount,
                'status' => $status,
                'deposit_ids' => $depositIds,
            ];
        }

        return [
            'user' => $member->user()->first(),
            'months' => $months,
            'total_expected' => $totalExpected,
            'total_paid' => $totalPaid,
            'pending' => $totalPending,
            'due_count' => $dueCount,
            'overdue_count' => $overdueCount,
        ];
    }

    /**
     * Manager overview: all active members with their schedules.
     */
    public static function somitiDues(Somiti $somiti): array
    {
        $members = SomitiMember::where('somiti_id', $somiti->id)
            ->where('is_active', true)
            ->with('user')
            ->orderBy('joined_at')
            ->get();

        $schedules = $members->map(fn (SomitiMember $m) => static::memberSchedule($somiti, $m))->values();

        return [
            'settings' => [
                'monthly_deposit_amount' => $somiti->monthly_deposit_amount,
                'due_day' => $somiti->due_day,
                'grace_days' => $somiti->loan_grace_days,
            ],
            'current_month' => now()->format('Y-m'),
            'members' => $schedules,
            'totals' => [
                'expected' => (float) $schedules->sum('total_expected'),
                'paid' => (float) $schedules->sum('total_paid'),
                'pending' => (float) $schedules->sum('pending'),
                'due_months' => (int) $schedules->sum('due_count'),
                'overdue_months' => (int) $schedules->sum('overdue_count'),
            ],
        ];
    }

    /**
     * A single member's schedule (for the member themselves or a manager).
     */
    public static function memberDues(Somiti $somiti, int $userId): array
    {
        $member = SomitiMember::where('somiti_id', $somiti->id)->where('user_id', $userId)->firstOrFail();

        return static::memberSchedule($somiti, $member);
    }

    /**
     * Members who still owe the given month key.
     */
    public static function unpaidMembers(Somiti $somiti, string $monthKey): Collection
    {
        $expected = (float) ($somiti->monthly_deposit_amount ?? 0);
        if ($expected <= 0) {
            return collect();
        }

        return SomitiMember::where('somiti_id', $somiti->id)
            ->where('is_active', true)
            ->with('user')
            ->get()
            ->filter(function (SomitiMember $member) use ($somiti, $monthKey, $expected) {
                if (static::scheduleStart($member, $somiti)->format('Y-m') > $monthKey) {
                    return false;
                }
                $paid = static::paidByMonth($somiti, $member->user_id)->get($monthKey)?->sum('amount') ?? 0;

                return $paid < $expected;
            });
    }
}
