<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Share;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function index()
    {
        $shares = Share::with(['somiti', 'financialYear'])
            ->whereHas('somiti', function ($query) {
                $query->where('created_by_user_id', auth()->id())
                    ->orWhereHas('members', fn ($q) => $q->where('user_id', auth()->id()));
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('ShareTypes/Index', [
            'shares' => $shares,
        ]);
    }

    public function show(Share $share_type)
    {
        return Inertia::render('ShareTypes/Show', [
            'share' => $share_type->load(['somiti', 'financialYear']),
        ]);
    }
}
