<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Models\SomitiMessage;
use App\Events\SomitiMessageSent;
use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SomitiChatController extends Controller
{
    public function index(Somiti $somiti)
    {
        $user = auth()->user();

        if (! $user->isMemberOfSomiti($somiti->id)
            && ! $user->isManagerOfSomiti($somiti->id)
            && ! $user->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $messages = SomitiMessage::with('user:id,name')
            ->where('somiti_id', $somiti->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $onlineUsers = SomitiMember::with('user:id,name')
            ->where('somiti_id', $somiti->id)
            ->where('is_active', true)
            ->limit(10)
            ->get()
            ->pluck('user');

        return Inertia::render('Somiti/Chat', [
            'somiti' => $somiti,
            'messages' => $messages,
            'onlineUsers' => $onlineUsers,
            'members' => $somiti->users()->select('users.id', 'users.name')->get(),
        ]);
    }

    public function typing(Somiti $somiti)
    {
        broadcast(new UserTyping($somiti->id, auth()->id(), auth()->user()->name));

        return response()->noContent();
    }

    public function send(Request $request, Somiti $somiti)
    {
        $user = auth()->user();

        if (! $user->isMemberOfSomiti($somiti->id)
            && ! $user->isManagerOfSomiti($somiti->id)
            && ! $user->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $message = SomitiMessage::create([
            'somiti_id' => $somiti->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
        ]);

        broadcast(new SomitiMessageSent($message));

        // Notify other members
        Notification::sendToSomiti($somiti, "New message from {$user->name}", \Illuminate\Support\Str::limit($message->message, 100));

        return redirect()->back();
    }
}
