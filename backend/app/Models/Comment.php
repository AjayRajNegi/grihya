<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['blog_id', 'user_id', 'name', 'email', 'body', 'status', 'parent_id'];

    public function post()
    {
        return $this->belongsTo(Blog::class, 'blog_id');
    }

    public function scopeApproved($q)
    {
        return $q->where('status', 'approved');
    }
}
