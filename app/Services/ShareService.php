<?php

namespace App\Services;

use App\Models\ShareOwnershipHistory;
use App\Models\ShareTransfer;
use App\Models\UserShare;
use Illuminate\Support\Facades\DB;

class ShareService
{
    /**
     * Get current share balance for a user in a somiti by financial year.
     */
    public static function getBalance(int $userId, int $somitiId, int $financialYearId): int
    {
        return (int) UserShare::where('user_id', $userId)
            ->where('somiti_id', $somitiId)
            ->where('financial_year_id', $financialYearId)
            ->sum('share_count');
    }

    /**
     * Get current share balance across all financial years.
     */
    public static function getTotalBalance(int $userId, int $somitiId): int
    {
        return (int) UserShare::where('user_id', $userId)
            ->where('somiti_id', $somitiId)
            ->sum('share_count');
    }

    /**
     * Record a share ownership change with full history.
     * This is the ONLY method that should modify UserShare.share_count.
     */
    public static function recordOwnershipChange(
        int $userId,
        int $somitiId,
        int $financialYearId,
        int $delta,
        string $entryType,
        ?ShareTransfer $transfer = null,
        ?object $reference = null,
    ): void {
        DB::transaction(function () use ($userId, $somitiId, $financialYearId, $delta, $entryType, $transfer, $reference) {
            $currentBalance = self::getBalance($userId, $somitiId, $financialYearId);
            $newBalance = $currentBalance + $delta;

            if ($newBalance < 0) {
                throw new \InvalidArgumentException("Insufficient shares: balance={$currentBalance}, delta={$delta}");
            }

            // Update or create the UserShare record
            UserShare::updateOrCreate(
                [
                    'user_id' => $userId,
                    'somiti_id' => $somitiId,
                    'financial_year_id' => $financialYearId,
                ],
                ['share_count' => $newBalance]
            );

            if ($currentBalance !== $newBalance) {
                UserShare::where('user_id', $userId)
                    ->where('somiti_id', $somitiId)
                    ->where('financial_year_id', $financialYearId)
                    ->update(['share_count' => $newBalance]);
            }

            // Record immutable history
            $historyData = [
                'somiti_id' => $somitiId,
                'user_id' => $userId,
                'share_transfer_id' => $transfer?->id,
                'financial_year_id' => $financialYearId,
                'shares_before' => $currentBalance,
                'shares_after' => $newBalance,
                'delta' => $delta,
                'entry_type' => $entryType,
            ];

            if ($reference) {
                $historyData['reference_type'] = get_class($reference);
                $historyData['reference_id'] = $reference->id;
            }

            ShareOwnershipHistory::create($historyData);
        });
    }

    /**
     * Execute a share transfer with full double-entry accounting and history.
     */
    public static function executeTransfer(ShareTransfer $transfer): void
    {
        DB::transaction(function () use ($transfer) {
            // Re-validate sender balance
            if ($transfer->from_user_id) {
                $senderBalance = self::getBalance(
                    $transfer->from_user_id,
                    $transfer->somiti_id,
                    $transfer->financial_year_id
                );

                if ($senderBalance < $transfer->quantity) {
                    throw new \InvalidArgumentException(
                        "Insufficient shares for transfer: need {$transfer->quantity}, have {$senderBalance}"
                    );
                }
            }

            // Record sender deduction
            if ($transfer->from_user_id) {
                self::recordOwnershipChange(
                    $transfer->from_user_id,
                    $transfer->somiti_id,
                    $transfer->financial_year_id,
                    -$transfer->quantity,
                    ShareOwnershipHistory::TYPE_TRANSFER_OUT,
                    $transfer
                );
            }

            // Record receiver addition
            self::recordOwnershipChange(
                $transfer->to_user_id,
                $transfer->somiti_id,
                $transfer->financial_year_id,
                $transfer->quantity,
                $transfer->from_user_id
                    ? ShareOwnershipHistory::TYPE_TRANSFER_IN
                    : ShareOwnershipHistory::TYPE_ISSUANCE,
                $transfer
            );

            // Create double-entry journal
            AccountingService::recordShareTransfer($transfer);
        });
    }

    /**
     * Get ownership history chronologically for a user in a somiti.
     */
    public static function getHistory(int $userId, int $somitiId): array
    {
        return ShareOwnershipHistory::forUser($userId, $somitiId)->toArray();
    }

    /**
     * Get point-in-time balance for a user.
     */
    public static function getBalanceAtDate(int $userId, int $somitiId, ?string $date = null): int
    {
        return ShareOwnershipHistory::balanceAt($userId, $somitiId, $date);
    }
}
