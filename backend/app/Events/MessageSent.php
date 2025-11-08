<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use SerializesModels;

    public array $payload;
    protected string $token;

    public function __construct(Message $message)
    {
        $message->load('conversation');
        $this->token = $message->conversation->public_token;

        $this->payload = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender' => $message->sender, // 'user' | 'admin'
            'sender_id' => $message->sender_id,
            'body' => $message->body,
            'created_at' => $message->created_at?->toISOString(),
        ];
    }

    public function broadcastOn()
    {
        return new Channel('chat.conversation.' . $this->token);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
