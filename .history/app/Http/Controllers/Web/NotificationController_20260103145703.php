<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where(function ($q) {
            $q->where('user_id', Auth::id())->orWhereNotNull('somiti_id');
        })->orderByDesc('created_at')->paginate(25);

        return view('notifications.index', compact('notifications'));
    }

    public function show(Notification $notification)
    {
        if (! Auth::user()->can('view', $notification)) abort(403);

        return view('notifications.show', ['notification' => $notification]);
    }

    public function markRead(Notification $notification)
    {
        if (! Auth::user()->can('markRead', $notification)) abort(403);

        $notification->markRead();

        return redirect()->back();
    }

    public function destroy(Notification $notification)
    {
        if (! Auth::user()->can('delete', $notification)) abort(403);

        $notification->delete();

        return redirect()->back();
    }
}
