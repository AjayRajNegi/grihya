<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Blog $post)
    {
        // Return most recent approved comments
        $comments = $post->comments()
            ->where('status', 'approved')
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, Blog $post)
    {
        $data = $request->validate([
            'name'      => 'nullable|string|max:100',
            'email'     => 'nullable|email',
            'body'      => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = $post->comments()->create([
            'name'      => $data['name'] ?? null,
            'email'     => $data['email'] ?? null,
            'body'      => $data['body'],
            'parent_id' => $data['parent_id'] ?? null,
            'status'    => 'approved', // or 'pending' if you want moderation
        ]);

        $post->increment('comments_count');

        return response()->json($comment, 201);
    }
}
