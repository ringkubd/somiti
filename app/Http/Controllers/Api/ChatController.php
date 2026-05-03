<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Somiti;
use App\Models\SomitiMessage;
use App\Events\SomitiMessageSent;
use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get paginated message history for a somiti.
     */
    public function messages(Somiti $somiti)
    {
        $user = Auth::user();

        if (! $user->isMemberOfSomiti($somiti->id)
            && ! $user->isManagerOfSomiti($somiti->id)
            && ! $user->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $messages = SomitiMessage::with('user:id,name')
            ->where('somiti_id', $somiti->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    /**
     * Send a message to a somiti.
     */
    public function send(Request $request, Somiti $somiti)
    {
        $user = Auth::user();

        if (! $user->isMemberOfSomiti($somiti->id)
            && ! $user->isManagerOfSomiti($somiti->id)
            && ! $user->isOwnerOfSomiti($somiti->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'message_type' => 'nullable|string|in:text,image,file,system',
            'attachment_url' => 'nullable|url',
        ]);

        $message = SomitiMessage::create([
            'somiti_id' => $somiti->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'message_type' => $validated['message_type'] ?? 'text',
            'attachment_url' => $validated['attachment_url'] ?? null,
        ]);

        // Broadcast to all somiti members
        broadcast(new SomitiMessageSent($message));

        // Notify other members
        Notification::sendToSomiti($somiti, "New message from {$user->name}", Str::limit($message->message, 100));

        return response()->json($message->load('user:id,name'), 201);
    }

    public function typing(Request $request, Somiti $somiti)
    {
        $user = Auth::user();
        broadcast(new UserTyping($somiti->id, $user->id, $user->name));

        return response()->json(['typing' => true]);
    }

    public function upload(Request $request)
    {
        $request->validate(['file' => 'required|file|max:10240']);

        $path = $request->file('file')->store('chat-attachments', 'public');

        return response()->json([
            'url' => Storage::url($path),
            'name' => $request->file('file')->getClientOriginalName(),
            'size' => $request->file('file')->getSize(),
        ]);
    }
}
