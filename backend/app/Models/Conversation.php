<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'user_id',
        'public_token',
        'client_name',
        'client_email',
        'client_phone',
        'status',
        'last_message_at'
    ];

    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }
}
