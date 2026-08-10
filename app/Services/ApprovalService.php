<?php

namespace App\Services;

use App\Models\Approval;
use App\Models\Deposit;
use App\Models\Fdr;
use App\Models\Investment;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\ManagerElection;
use App\Models\Penalty;
use App\Models\ShareTransfer;
use App\Models\SomitiWorkflow;
use App\Models\User;
use App\Models\UserShare;
use App\Models\Withdrawal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ApprovalService
{
    private const APPROVABLES = [
        Deposit::class,
        Loan::class,
        Investment::class,
        Fdr::class,
        UserShare::class,
        ShareTransfer::class,
        LoanRepayment::class,
        Withdrawal::class,
        Penalty::class,
        ManagerElection::class,
    ];

    public static function workflowType(string $class): string
    {
        return match ($class) {
            Deposit::class => 'deposit',
            Loan::class => 'loan',
            Investment::class => 'investment',
            Fdr::class => 'fdr',
            UserShare::class => 'share',
            ShareTransfer::class => 'share_transfer',
            LoanRepayment::class => 'loan_repayment',
            Withdrawal::class => 'withdrawal',
            Penalty::class => 'penalty',
            ManagerElection::class => 'manager_election',
            default => 'deposit',
        };
    }

    /**
     * Cast a vote (approve/reject) on an approvable as the given user.
     * Finalizes the approvable when the quorum (or manager-alone rule) is met.
     */
    public static function vote(
        User $voter,
        string $approvableType,
        int $approvableId,
        string $decision,
        ?string $comment = null,
        ?string $signature = null
    ): Approval {
        if (! in_array($approvableType, self::APPROVABLES, true)) {
            throw ValidationException::withMessages(['approvable_type' => 'Invalid approvable type.']);
        }

        /** @var Model $approvable */
        $approvable = $approvableType::findOrFail($approvableId);
        $somitiId = $approvable->somiti_id ?? null;

        if (! $somitiId) {
            abort(422, 'Approvable is not tied to a somiti.');
        }

        $isManager = $voter->isManagerOfSomiti($somitiId) || $voter->isOwnerOfSomiti($somitiId);
        $isMember = \App\Models\SomitiMember::where('somiti_id', $somitiId)
            ->where('user_id', $voter->id)
            ->where('is_active', true)
            ->exists();

        if (! $isMember && ! $isManager) {
            abort(403, 'You are not an active member of this somiti.');
        }

        // A member cannot vote on their own request (managers/owners may sign off).
        $creatorId = $approvable->user_id ?? null;
        if ($creatorId === $voter->id && ! $isManager) {
            throw ValidationException::withMessages(['approvable' => 'You cannot vote on your own request.']);
        }

        // Manager-election candidates cannot vote for themselves either.
        if ($approvable instanceof ManagerElection && $approvable->candidate_user_id === $voter->id && ! $isManager) {
            throw ValidationException::withMessages(['approvable' => 'The candidate cannot vote on their own election.']);
        }

        if (isset($approvable->status) && $approvable->status !== 'pending') {
            throw ValidationException::withMessages(['approvable' => 'This request is already finalized.']);
        }

        $approval = $approvable->approvals()->updateOrCreate(
            ['user_id' => $voter->id],
            [
                'status' => $decision,
                'comment' => $comment,
                'signature' => $signature,
                'decided_at' => now(),
            ]
        );

        $workflow = SomitiWorkflow::getForType($somitiId, static::workflowType($approvableType));

        // Manager elections always run majority voting.
        if ($approvable instanceof ManagerElection) {
            $workflow->quorum_type = 'majority';
        }

        $approvedCount = $approvable->approvals()->where('status', 'approved')->count();
        $rejectedCount = $approvable->approvals()->where('status', 'rejected')->count();

        $isMajority = $workflow->quorum_type === 'majority';
        $finalize = false;

        if ($isMajority) {
            // Strict majority of eligible active members — the most votes decide.
            $eligible = \App\Models\SomitiMember::where('somiti_id', $somitiId)
                ->where('is_active', true)
                ->whereNotNull('joined_at')
                ->count();
            $needed = intdiv(max(1, $eligible), 2) + 1;

            if ($decision === 'approved' && $approvedCount >= $needed) {
                $finalize = true;
            } elseif ($decision === 'rejected' && $rejectedCount >= $needed) {
                $finalize = true;
            }
        } else {
            $minApprovals = max(1, (int) $workflow->min_approvals_required);
            if ($workflow->quorum_type === 'all_members') {
                $minApprovals = \App\Models\SomitiMember::where('somiti_id', $somitiId)
                    ->where('is_active', true)
                    ->whereNotNull('joined_at')
                    ->count();
                // The creator cannot vote on their own request, so they are excluded.
                if ($creatorId) {
                    $minApprovals = max(0, $minApprovals - 1);
                }
                $minApprovals = max(1, $minApprovals);
            }

            if ($isManager && $workflow->manager_can_approve_alone) {
                $finalize = true;
            } elseif ($decision === 'approved' && $approvedCount >= $minApprovals) {
                $finalize = true;
            } elseif ($decision === 'rejected' && $rejectedCount >= $minApprovals) {
                $finalize = true;
            }
        }

        if ($finalize) {
            if ($decision === 'approved' && method_exists($approvable, 'approve')) {
                $approvable->approve($voter->id);
            } elseif ($decision === 'rejected' && method_exists($approvable, 'reject')) {
                $approvable->reject($voter->id, $comment);
            }
        }

        return $approval->fresh();
    }
}
