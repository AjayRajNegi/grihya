<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Blog extends Model
{
    use SoftDeletes, HasFactory;

    protected $table = 'blogs';
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image_path',
        'author_id',
        'status',
        'published_at',
        'likes_count',
        'shares_count',
        'comments_count',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'content' => 'array',
        'published_at' => 'datetime',
    ];

    protected $appends = ['cover_url'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class, 'blog_id');
    }
    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }

    public function getCoverUrlAttribute(): string
    {
        // Prefer the correct column; fallback to legacy if present
        $cover = $this->cover_image_path ?? $this->cover_image ?? null;

        // No image => placeholder
        if (!$cover) {
            return 'https://via.placeholder.com/600x360?text=Cover';
        }

        // External URL (S3/CDN/etc.)
        if (preg_match('/^https?:/i', $cover)) {
            return $cover;
        }

        // Normalize slashes/whitespace
        $cover = trim(str_replace('\\', '/', $cover));

        // If someone stored a public URL like "/storage/..."
        if (preg_match('#^/?storage/#i', $cover)) {
            $cover = preg_replace('#^/?storage/#i', '', $cover); // strip leading "/storage/"
        }

        // If an absolute filesystem path leaked, extract just "blog/..." or "blog_covers/..."
        if (preg_match('#(blog(?:_covers)?/[^"\']+)$#i', $cover, $m)) {
            $cover = $m[1];
        }

        // Strip any leading "public/" or "storage/" (case-insensitive)
        $path = ltrim($cover, '/');
        $path = preg_replace('#^(public/|storage/)#i', '', $path);

        // Return root‑relative public URL (avoids APP_URL double-slash issues)
        return '/storage/' . $path;
    }


    // Optional: normalize what gets stored into cover_image_path
    public function setCoverImagePathAttribute($value): void
    {
        if (!$value) {
            $this->attributes['cover_image_path'] = null;
            return;
        }

        if (preg_match('/^https?:/i', $value)) {
            $this->attributes['cover_image_path'] = $value;
            return;
        }

        if (preg_match('#blog_covers/[^"\']+$#', $value, $m)) {
            $value = $m[0];
        }

        $value = ltrim($value, '/');
        $value = preg_replace('#^(public/|storage/)#', '', $value);

        $this->attributes['cover_image_path'] = $value;
    }
}
