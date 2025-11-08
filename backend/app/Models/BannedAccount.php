<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BannedAccount extends Model
{
    protected $table = 'banned_accounts';

    protected $fillable = [
        'user_id',
        'banned_by',
        'banned_at',
        'reason',
        'name',
        'email',
        'email_canonical',
        'phone',
        'city',
        'role',
        'email_verified_at',
        'phone_verified_at',
        'original_created_at',
    ];

    protected $casts = [
        'banned_at'          => 'datetime',
        'email_verified_at'  => 'datetime',
        'phone_verified_at'  => 'datetime',
        'original_created_at' => 'datetime',
    ];

    protected $guarded = [];
}
