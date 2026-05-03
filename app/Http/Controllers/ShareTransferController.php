<?php

namespace App\Http\Controllers;

class ShareTransferController extends Controller
{
    public function index()
    {
        $transfers = \App\Models\ShareTransfer::with(['somiti', 'fromUser', 'toUser'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', function ($q) {
                        $q->where('user_id', auth()->id());
                    });
            })
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('ShareTransfers/Index', [
            'transfers' => $transfers,
        ]);
    }

    public function create(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $somitiId = $request->query('somiti_id');

        $somitis = \App\Models\Somiti::with(['users' => function ($q) {
            $q->select('users.id', 'users.name');
        }])
            ->where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->get();

        return \Inertia\Inertia::render('ShareTransfers/Create', [
            'somitis' => $somitis,
            'selectedSomitiId' => $somitiId ? (int) $somitiId : null,
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'somiti_id' => 'required|exists:somitis,id',
            'to_user_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
            'price_per_share' => 'required|numeric|min:0',
            'transfer_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $somiti = \App\Models\Somiti::findOrFail($request->somiti_id);

        // Optional: Ensure the sender has enough shares (unless it's from the somiti treasury, where from_user_id is null)
        // For peer-to-peer, from_user_id is the logged in user.
        $fromUserId = auth()->id();

        $senderShares = \App\Models\UserShare::where('somiti_id', $somiti->id)
            ->where('user_id', $fromUserId)
            ->first();

        if (! $senderShares || $senderShares->quantity < $request->quantity) {
            return back()->withErrors(['quantity' => 'You do not have enough shares to transfer.']);
        }

        $transfer = \App\Models\ShareTransfer::create([
            'somiti_id' => $somiti->id,
            'from_user_id' => $fromUserId,
            'to_user_id' => $request->to_user_id,
            'quantity' => $request->quantity,
            'price_per_share' => $request->price_per_share,
            'transfer_date' => $request->transfer_date,
            'notes' => $request->notes,
            'status' => 'pending',
        ]);

        // Request approval from the Somiti admin
        $transfer->requestApproval($somiti->created_by_user_id, 'New share transfer request.');

        return redirect()->route('share-transfers.index')->with('success', 'Share transfer request submitted for approval.');
    }
}
