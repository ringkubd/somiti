<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShareTransfer;
use App\Services\ShareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShareTransferController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $transfers = ShareTransfer::with(['somiti', 'fromUser', 'toUser'])
            ->whereHas('somiti', fn($q) => $q
                ->where('created_by_user_id', $user->id)
                ->orWhereHas('members', fn($q2) => $q2->where('user_id', $user->id)))
            ->latest()
            ->paginate(20);

        return response()->json($transfers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'financial_year_id' => 'required|exists:financial_years,id',
            'to_user_id' => 'required|exists:users,id|different:' . Auth::id(),
            'quantity' => 'required|integer|min:1',
            'price_per_share' => 'required|numeric|min:0.01',
            'transfer_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $senderBalance = ShareService::getBalance(Auth::id(), $validated['somiti_id'], $validated['financial_year_id']);
        if ($senderBalance < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient shares.'], 422);
        }

        $transfer = ShareTransfer::create(array_merge($validated, [
            'from_user_id' => Auth::id(),
            'status' => 'pending',
        ]));

        $somiti = \App\Models\Somiti::find($validated['somiti_id']);
        $transfer->requestApproval($somiti->created_by_user_id, 'New share transfer.');

        return response()->json($transfer, 201);
    }

    public function show(ShareTransfer $shareTransfer)
    {
        return response()->json($shareTransfer->load(['somiti', 'fromUser', 'toUser']));
    }

    public function approve(Request $request, ShareTransfer $shareTransfer)
    {
        if (! Auth::user()->isManagerOfSomiti($shareTransfer->somiti_id)
            && ! Auth::user()->isOwnerOfSomiti($shareTransfer->somiti_id)) {
            abort(403);
        }

        $shareTransfer->approve(Auth::id());

        return response()->json($shareTransfer);
    }

    public function reject(Request $request, ShareTransfer $shareTransfer)
    {
        if (! Auth::user()->isManagerOfSomiti($shareTransfer->somiti_id)
            && ! Auth::user()->isOwnerOfSomiti($shareTransfer->somiti_id)) {
            abort(403);
        }

        $shareTransfer->reject(Auth::id(), $request->input('comment'));

        return response()->json($shareTransfer);
    }
}
