<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Somiti;

class ChatRedirectController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Find the first somiti the user belongs to
        $somiti = Somiti::where('created_by_user_id', $user->id)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $somiti) {
            return redirect()->route('somitis.index')->with('error', 'No somiti found. Create one first.');
        }

        return redirect()->route('somitis.chat', $somiti);
    }
}
