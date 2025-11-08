<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // Start or resume a conversation
    public function start(Request $request)
    {
        $request->validate([
            'client_name'  => 'nullable|string|max:120',
            'client_email' => 'nullable|email|max:180',
            'client_phone' => 'nullable|string|max:20',
            'token'        => 'nullable|string',
        ]);

        // Resume if token provided
        if ($request->filled('token')) {
            $existing = Conversation::where('public_token', $request->input('token'))->first();
            if ($existing) {
                return response()->json($this->convPayload($existing));
            }
        }

        $user = $request->user(); // guaranteed by auth:sanctum

        // If client_* not provided, default to authenticated user's info (adapt field names to your User model)
        $clientName  = $request->input('client_name')  ?? ($user->name  ?? null);
        $clientEmail = $request->input('client_email') ?? ($user->email ?? null);
        $clientPhone = $request->input('client_phone') ?? ($user->phone ?? null); // if you have phone column

        $conv = Conversation::create([
            'user_id'      => $user?->id,
            'public_token' => (string) Str::uuid(),
            'client_name'  => $clientName,
            'client_email' => $clientEmail,
            'client_phone' => $clientPhone,
            'status'       => 'open',
        ]);

        return response()->json($this->convPayload($conv));
    }

    // Paginated messages for a conversation (with ISO timestamps)
    public function messages(Request $request, string $token)
    {
        $conv = Conversation::where('public_token', $token)->firstOrFail();

        $perPage = (int) min(50, max(10, (int) $request->query('per_page', 20)));
        $items = $conv->messages()->orderBy('created_at', 'asc')->paginate($perPage);

        $data = collect($items->items())->map(function (Message $m) {
            return [
                'id'              => $m->id,
                'conversation_id' => $m->conversation_id,
                'sender'          => $m->sender,
                'sender_id'       => $m->sender_id,
                'body'            => $m->body,
                'created_at'      => $m->created_at?->toISOString(),
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page'    => $items->lastPage(),
            ],
        ]);
    }

    // Send a message (only auth users reach here now)
    public function send(Request $request, string $token)
    {
        $request->validate([
            'body'    => 'nullable|string',
            'sender'  => 'required|in:user,admin',
            'temp_id' => 'nullable|string|max:64',
        ]);

        $conv = Conversation::where('public_token', $token)->firstOrFail();

        $msg = $conv->messages()->create([
            'sender'    => $request->input('sender'),
            'sender_id' => $request->user()?->id, // null-safe (but user exists due to auth:sanctum)
            'body'      => $request->input('body'),
        ]);

        $conv->update(['last_message_at' => now()]);

        try {
            broadcast(new MessageSent($msg))->toOthers();
        } catch (\Throwable $e) {
            Log::error('Broadcast failed: ' . $e->getMessage());
            // Do NOT throw. We still return 200 so the frontend doesn’t revert bubbles.
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
                'temp_id'         => $request->input('temp_id'),
            ],
        ]);
    }

    public function markRead(Request $request, string $token)
    {
        $request->validate(['as' => 'required|in:user,admin']);

        $conv = Conversation::where('public_token', $token)->firstOrFail();

        $conv->messages()
            ->whereNull('read_at')
            ->where('sender', $request->input('as') === 'user' ? 'admin' : 'user')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    protected function convPayload(Conversation $c): array
    {
        return [
            'conversation' => [
                'id'           => $c->id,
                'public_token' => $c->public_token,
                'client_name'  => $c->client_name,
                'client_email' => $c->client_email,
                'client_phone' => $c->client_phone,
                'status'       => $c->status,
            ],
        ];
    }
}
