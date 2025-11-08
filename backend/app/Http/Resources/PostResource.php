<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostResource extends JsonResource
{
    protected function absoluteFromStorage(?string $path): ?string
    {
        if (!$path) return null;
        if (Str::startsWith($path, ['http://', 'https://', 'data:'])) return $path;

        // Already "/storage/..." or "storage/..."
        if (Str::startsWith($path, ['/storage/', 'storage/'])) {
            $url = Str::startsWith($path, ['/']) ? $path : "/$path";
            return rtrim(config('app.url'), '/') . $url;
        }

        // Disk path like "blog/filename.jpg" => "/storage/blog/filename.jpg"
        $url = Storage::url($path);
        return rtrim(config('app.url'), '/') . $url;
    }

    protected function normalizedContent(?array $content): array
    {
        if (!is_array($content)) return [];
        return array_map(function ($block) {
            if (!is_array($block)) return $block;
            $type = $block['type'] ?? null;
            $data = $block['data'] ?? [];

            if ($type === 'image') {
                // Prefer stored file path (src), fallback to pasted URL (src_url)
                $src = $data['src'] ?? ($data['src_url'] ?? null);
                $data['src_url'] = $this->absoluteFromStorage($src);
            }

            if ($type === 'hero') {
                // Prefer stored file path (image), fallback to pasted URL (image_url)
                $img = $data['image'] ?? ($data['image_url'] ?? null);
                $data['image_url'] = $this->absoluteFromStorage($img);
            }

            $block['data'] = $data;
            return $block;
        }, $content);
    }

    public function toArray($request)
    {
        return [
            'id'               => $this->id,
            'slug'             => $this->slug,
            'title'            => $this->title,
            'excerpt'          => $this->excerpt,
            'author'           => optional($this->author)->name ?? 'EasyLease Team',
            'published_at'     => optional($this->published_at)->toIso8601String(),
            'likes_count'      => (int) $this->likes_count,
            'shares_count'     => (int) $this->shares_count,
            'comments_count'   => (int) $this->comments_count,
            'cover_image_url'  => $this->absoluteFromStorage($this->cover_image_path),
            'content'          => $this->normalizedContent($this->content),
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
        ];
    }
}