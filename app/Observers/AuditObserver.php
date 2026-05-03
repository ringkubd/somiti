<?php

namespace App\Observers;

use App\Models\TransactionEvent;
use Illuminate\Database\Eloquent\Model;

class AuditObserver
{
    /**
     * On model creation, record a 'created' event.
     */
    public function created(Model $model): void
    {
        if (! $this->shouldAudit($model)) {
            return;
        }

        TransactionEvent::record(
            $this->getSomitiId($model),
            $this->getActorId($model),
            TransactionEvent::EVENT_CREATED,
            get_class($model),
            $model->id,
            $model->toArray(),
        );
    }

    /**
     * On model update, record an event relevant to what changed.
     */
    public function updated(Model $model): void
    {
        if (! $this->shouldAudit($model)) {
            return;
        }

        $eventType = $this->determineEventType($model);

        $payload = [
            'new' => $model->getChanges(),
            'current' => $model->only(array_keys($model->getChanges())),
        ];

        TransactionEvent::record(
            $this->getSomitiId($model),
            $this->getActorId($model),
            $eventType,
            get_class($model),
            $model->id,
            $payload,
        );
    }

    /**
     * Determine which models to audit.
     */
    private function shouldAudit(Model $model): bool
    {
        $auditable = [
            \App\Models\Deposit::class,
            \App\Models\Loan::class,
            \App\Models\Investment::class,
            \App\Models\Fdr::class,
            \App\Models\UserShare::class,
            \App\Models\ShareTransfer::class,
            \App\Models\Share::class,
            \App\Models\FinancialYear::class,
            \App\Models\JournalEntry::class,
        ];

        return in_array(get_class($model), $auditable, true);
    }

    /**
     * Determine the event type based on what changed.
     */
    private function determineEventType(Model $model): string
    {
        $changes = $model->getChanges();

        // Status transitions drive event types
        if (array_key_exists('status', $changes)) {
            $newStatus = $changes['status'];

            return match ($newStatus) {
                'approved' => TransactionEvent::EVENT_APPROVED,
                'rejected' => TransactionEvent::EVENT_REJECTED,
                'disbursed' => TransactionEvent::EVENT_DISBURSED,
                default => TransactionEvent::EVENT_UPDATED,
            };
        }

        // Share transfers
        if ($model instanceof \App\Models\ShareTransfer && array_key_exists('status', $changes)) {
            return TransactionEvent::EVENT_TRANSFERRED;
        }

        return TransactionEvent::EVENT_UPDATED;
    }

    /**
     * Extract somiti_id from a model, handling various structures.
     */
    private function getSomitiId(Model $model): ?int
    {
        if (isset($model->somiti_id)) {
            return $model->somiti_id;
        }

        // FinancialYear belongs to somiti via somiti_id
        if ($model instanceof \App\Models\FinancialYear) {
            return $model->somiti_id;
        }

        return null;
    }

    /**
     * Try to determine who initiated the change.
     */
    private function getActorId(Model $model): ?int
    {
        // Models with approved_by
        if ($model->isDirty('approved_by') && $model->approved_by) {
            return $model->approved_by;
        }

        // Fallback to authenticated user
        return auth()->check() ? auth()->id() : null;
    }
}
