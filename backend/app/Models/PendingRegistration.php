<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PendingRegistration extends Model
{
     protected $fillable = [
        'role', 'name', 'email', 'email_canonical', 'phone',
        'password_hash', 'token_hash', 'expires_at','city'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
    
    public function scopeActive($q)
    {
        return $q->where('expires_at', '>', Carbon::now());
    }
}
