<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditController extends Controller
{
    /**
     * List all transaction events for a somiti, with optional filtering.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $somitiId) {
            return response()->json(['message' => 'somiti_id is required'], 400);
        }

        if (! $user->isMemberOfSomiti($somitiId)
            && ! $user->isManagerOfSomiti($somitiId)
            && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        $query = TransactionEvent::where('somiti_id', $somitiId)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc');

        if ($type = $request->query('event_type')) {
            $query->where('event_type', $type);
        }

        if ($entityType = $request->query('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        $events = $query->paginate($request->query('per_page', 50));

        return response()->json($events);
    }

    /**
     * Show audit trail for a specific entity.
     */
    public function showByEntity(Request $request, string $entityType, int $entityId)
    {
        $modelClass = $this->resolveEntityClass($entityType);
        if (! $modelClass) {
            return response()->json(['message' => 'Unknown entity type'], 400);
        }

        $model = $modelClass::findOrFail($entityId);

        if (isset($model->somiti_id)) {
            $user = Auth::user();
            if (! $user->isMemberOfSomiti($model->somiti_id)
                && ! $user->isManagerOfSomiti($model->somiti_id)
                && ! $user->isOwnerOfSomiti($model->somiti_id)) {
                abort(403);
            }
        }

        $events = TransactionEvent::forEntity($modelClass, $entityId);

        return response()->json([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'events' => $events,
        ]);
    }

    /**
     * Get event type counts for a somiti.
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        $somitiId = $request->query('somiti_id');

        if (! $somitiId) {
            return response()->json(['message' => 'somiti_id is required'], 400);
        }

        if (! $user->isMemberOfSomiti($somitiId)
            && ! $user->isManagerOfSomiti($somitiId)
            && ! $user->isOwnerOfSomiti($somitiId)) {
            abort(403);
        }

        $summary = TransactionEvent::where('somiti_id', $somitiId)
            ->selectRaw('event_type, count(*) as count')
            ->groupBy('event_type')
            ->get();

        return response()->json($summary);
    }

    private function resolveEntityClass(string $shortName): ?string
    {
        return match ($shortName) {
            'deposit' => \App\Models\Deposit::class,
            'loan' => \App\Models\Loan::class,
            'investment' => \App\Models\Investment::class,
            'fdr' => \App\Models\Fdr::class,
            'user-share' => \App\Models\UserShare::class,
            'share-transfer' => \App\Models\ShareTransfer::class,
            'share' => \App\Models\Share::class,
            'financial-year' => \App\Models\FinancialYear::class,
            'journal-entry' => \App\Models\JournalEntry::class,
            default => null,
        };
    }
}
