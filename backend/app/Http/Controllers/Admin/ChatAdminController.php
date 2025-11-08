<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class ChatAdminController extends Controller
{
    public function index()
    {
        return view('admin.chat.index');
    }

    // Conversations list with unread_count and robust last message time
    public function list(Request $request)
    {
        // Support both ?search= and ?q=
        $term = $request->query('search', $request->query('q'));

        $q = Conversation::query()
            ->when($request->filled('status'), function ($qq) use ($request) {
                $qq->where('status', $request->query('status'));
            })
            ->when($term, function ($qq) use ($term) {
                $qq->where(function ($w) use ($term) {
                    $w->where('client_name', 'like', "%{$term}%")
                        ->orWhere('public_token', 'like', "%{$term}%");
                });
            })
            // unread user messages per conversation
            ->withCount([
                'messages as unread_count' => function ($m) {
                    $m->whereNull('read_at')->where('sender', 'user');
                }
            ])
            // latest message timestamp (fallback if last_message_at is null)
            ->addSelect([
                'last_msg_at' => Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest('created_at')
                    ->limit(1)
            ]);

        // Sort by stored last_message_at, then by computed last_msg_at, then by id
        $items = $q->orderByDesc('last_message_at')
            ->orderByDesc('last_msg_at')
            ->orderByDesc('id')
            // IMPORTANT: do not restrict columns here, or computed columns are dropped
            ->paginate(20);

        // Transform items to a clean shape for the frontend while preserving paginator meta/links
        $items->setCollection(
            $items->getCollection()->map(function ($c) {
                $ts = $c->last_message_at ?? $c->last_msg_at;
                $tsIso = $ts ? Carbon::parse($ts)->toIso8601String() : null;

                return [
                    'public_token'    => $c->public_token,
                    'client_name'     => $c->client_name ?: 'Guest',
                    'status'          => $c->status,
                    'unread_count'    => (int) ($c->unread_count ?? 0),
                    'last_message_at' => $tsIso,
                ];
            })
        );

        return response()->json($items);
    }

    // Fetch messages for a conversation (web route)
    public function messages(Request $request, string $token)
    {
        $conv = Conversation::where('public_token', $token)->firstOrFail();

        $items = $conv->messages()
            ->orderBy('created_at', 'asc')
            ->get(['id', 'conversation_id', 'sender', 'sender_id', 'body', 'created_at']);

        $data = $items->map(function (Message $m) {
            return [
                'id'              => $m->id,
                'conversation_id' => $m->conversation_id,
                'sender'          => $m->sender,
                'sender_id'       => $m->sender_id,
                'body'            => $m->body,
                'created_at'      => $m->created_at?->toISOString(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    // Send a message as admin (web route)
    public function send(Request $request, string $token)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $conv = Conversation::where('public_token', $token)->firstOrFail();

        // Current admin id
        $adminId = Auth::user()?->id
            ?? Auth::guard('web')->user()?->id
            ?? session('admin_id')   // adjust if your middleware uses a different session key
            ?? null;

        $msg = $conv->messages()->create([
            'sender'    => 'admin',
            'sender_id' => $adminId, // nullable is OK if your schema allows it
            'body'      => $request->input('body'),
        ]);

        // Keep list sorting correct
        $conv->update(['last_message_at' => now()]);

        try {
            broadcast(new MessageSent($msg))->toOthers();
        } catch (\Throwable $e) {
            Log::error('Admin broadcast failed: ' . $e->getMessage());
        }

        return response()->json([
            'ok'      => true,
            'message' => [
                'id'              => $msg->id,
                'conversation_id' => $msg->conversation_id,
                'sender'          => $msg->sender,
                'sender_id'       => $msg->sender_id,
                'body'            => $msg->body,
                'created_at'      => $msg->created_at?->toISOString(),
            ],
        ]);
    }

    // Mark messages as read (user -> admin)
    public function markRead(Request $request, string $token)
    {
        $conv = Conversation::where('public_token', $token)->firstOrFail();

        Message::where('conversation_id', $conv->id)
            ->whereNull('read_at')
            ->where('sender', 'user')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    // Update conversation status (open/assigned/closed)
    public function updateStatus(Request $request, string $token)
    {
        $request->validate(['status' => 'required|in:open,assigned,closed']);

        $conversation = Conversation::where('public_token', $token)->firstOrFail();
        $conversation->status = $request->status;
        $conversation->save();

        return response()->json([
            'ok'   => true,
            'data' => [
                'status' => $conversation->status,
            ],
        ]);
    }
}
