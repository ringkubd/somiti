<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()->notifications()
            ->with(['somiti'])
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function show(Notification $notification)
    {
        if (! Auth::user()->can('view', $notification)) {
            abort(403);
        }

        return \Inertia\Inertia::render('Notifications/Show', ['notification' => $notification]);
    }

    public function markRead(Notification $notification)
    {
        if (! Auth::user()->can('markRead', $notification)) {
            abort(403);
        }

        $notification->markRead();

        return redirect()->back();
    }

    public function destroy(Notification $notification)
    {
        if (! Auth::user()->can('delete', $notification)) {
            abort(403);
        }

        $notification->delete();

        return redirect()->back();
    }
}
