<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // personal notifications
        $query = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere(function ($q2) use ($user) {
                  // somiti notifications where user is member, manager, or owner
                  $q2->whereNotNull('somiti_id')
                     ->whereIn('somiti_id', function ($sub) use ($user) {
                         $sub->select('somitis.id')
                             ->from('somitis')
                             ->join('somiti_members', 'somitis.id', '=', 'somiti_members.somiti_id')
                             ->where('somiti_members.user_id', $user->id)
                             ->where('somiti_members.is_active', 1);
                     });
              });
        });

        $list = $query->orderByDesc('created_at')->paginate(25);

        return response()->json($list);
    }

    public function show(Notification $notification)
    {
        if (! Auth::user()->can('view', $notification)) abort(403);

        return response()->json($notification);
    }

    public function markRead(Notification $notification)
    {
        if (! Auth::user()->can('markRead', $notification)) abort(403);

        $notification->markRead();

        return response()->json($notification);
    }

    public function destroy(Notification $notification)
    {
        if (! Auth::user()->can('delete', $notification)) abort(403);

        $notification->delete();

        return response()->json(['deleted' => true]);
    }
}
