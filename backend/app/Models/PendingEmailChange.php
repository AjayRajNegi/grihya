<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PendingEmailChange extends Model
{
    protected $fillable = [
        'user_id', 'new_email', 'new_email_canonical', 'token_hash', 'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function scopeActive($q)
    {
        return $q->where('expires_at', '>', Carbon::now());
    }
}
