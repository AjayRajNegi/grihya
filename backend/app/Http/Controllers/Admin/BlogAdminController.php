<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;


class BlogAdminController extends Controller
{
    public function index(Request $request)
    {
        $blogs = Blog::query()
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = $request->q;
                $q->where(function ($w) use ($term) {
                    $w->where('title', 'like', "%{$term}%")
                        ->orWhere('slug', 'like', "%{$term}%")
                        ->orWhere('excerpt', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByRaw("CASE WHEN status='published' THEN 0 ELSE 1 END")
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return view('admin.blog.index', compact('blogs'));
    }

    public function edit(Blog $blog)
    {
        $prefilledContent = collect($blog->content ?? [])->map(function ($block) {
            $type = $block['type'] ?? null;
            $data = $block['data'] ?? [];
            // helper to convert disk path -> /storage/ URL
            $toUrl = function (?string $p) {
                if (!$p) return null;
                if (preg_match('/^https?:/i', $p)) return $p;
                $p = str_replace('\\', '/', trim($p));
                if (preg_match('#^/?storage/#i', $p)) {
                    $p = preg_replace('#^/?storage/#i', '', $p);
                }
                // extract blog or blog_covers tail if absolute path leaked
                if (preg_match('#(blog(?:_covers)?/[^"\']+)$#i', $p, $m)) {
                    $p = $m[1];
                }
                $p = ltrim(preg_replace('#^(public/|storage/)#i', '', $p), '/');
                return '/storage/' . $p;
            };

            if ($type === 'hero') {
                // Prefer stored file (image), fallback to URL (image_url)
                $img = $data['image'] ?? ($data['image_url'] ?? null);
                $data['image_url'] = $img ? $toUrl($img) : null;
            }

            if ($type === 'image') {
                // Prefer stored file (src), fallback to URL (src_url)
                $src = $data['src'] ?? ($data['src_url'] ?? null);
                $data['src_url'] = $src ? $toUrl($src) : null;
            }

            return ['type' => $type, 'data' => $data];
        })->values();

        return view('admin.blog.edit', compact('blog', 'prefilledContent'));
        // return view('admin.blog.edit', compact('blog'));
    }

    public function update(Request $request, Blog $blog)
    {
        $data = $request->validate([
            'title'                  => ['sometimes', 'string', 'max:255'],
            'slug'                   => ['sometimes', 'string', 'max:255', Rule::unique('blogs', 'slug')->ignore($blog->id)],
            'excerpt'                => ['nullable', 'string', 'max:500'],

            'content'                => ['sometimes', 'array'],
            'content.*.type'         => ['required_with:content', Rule::in(['hero', 'heading', 'paragraph', 'image', 'quote', 'callout', 'problem_solution', 'list'])],
            'content.*.data'         => ['nullable', 'array'],
            'content.*.data.file'    => ['nullable', 'file', 'image', 'max:5120'],
            'content.*.data.src_url' => ['nullable', 'string'],
            'content.*.data.alt'     => ['nullable', 'string', 'max:255'],
            'content.*.data.caption' => ['nullable', 'string', 'max:255'],
            'content..data.style' => ['nullable', Rule::in(['ul', 'ol'])],
            'content..data.items' => ['nullable', 'array'],
            'content..data.items.' => ['nullable', 'string', 'max:500'],

            'cover_image_path'       => ['nullable', 'string', 'max:255'],
            'cover_image'            => ['nullable', 'image', 'max:5120'],

            'status'                 => ['sometimes', Rule::in(['draft', 'published'])],
            'published_at'           => ['nullable', 'date'],
            'meta_title'             => ['nullable', 'string', 'max:255'],
            'meta_description'       => ['nullable', 'string', 'max:160'],
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image_path'] = $request->file('cover_image')->store('blog', 'public');
        }

        if ($request->has('content')) {
            $data['content'] = $this->processBlocks($request);
        }

        $blog->update($data);

        return redirect()
            ->route('admin.blogs.index', $request->only('q', 'status', 'page'))
            ->with('success', 'Blog updated successfully.');
    }

    private function processBlocks(Request $request): array
    {
        $blocks = $request->input('content', []);
        $out = [];

        foreach ($blocks as $i => $block) {
            $type = $block['type'] ?? null;
            $data = $block['data'] ?? [];
            if (!$type) continue;

            switch ($type) {

                case 'hero': {
                        $file = $request->file("content.$i.data.file");
                        if ($file) {
                            $path = $file->store('blog', 'public');
                            $data['image'] = $path;
                        }
                        $out[] = [
                            'type' => 'hero',
                            'data' => [
                                'title'     => $data['title'] ?? '',
                                'image'     => $data['image'] ?? null,
                                'image_url' => $data['image_url'] ?? null,
                            ],
                        ];
                        break;
                    }

                case 'heading':
                    $out[] = [
                        'type' => 'heading',
                        'data' => [
                            'text'  => $data['text'] ?? '',
                            'level' => isset($data['level']) ? (int) $data['level'] : 2,
                        ],
                    ];
                    break;

                case 'paragraph':
                    $out[] = [
                        'type' => 'paragraph',
                        'data' => [
                            'html' => $data['html'] ?? '',
                        ],
                    ];
                    break;



                case 'image': {
                        $file = $request->file("content.$i.data.file");
                        if ($file) {
                            $path = $file->store('blog', 'public'); // e.g., "blog/filename.jpg"
                            $data['src'] = $path; // stored disk path
                        }
                        $out[] = [
                            'type' => 'image',
                            'data' => [
                                'src'     => $data['src']     ?? null,   // from uploaded file
                                'src_url' => $data['src_url'] ?? null,   // from pasted URL
                                'alt'     => $data['alt']     ?? '',
                                'caption' => $data['caption'] ?? '',
                            ],
                        ];
                        break;
                    }

                case 'quote':
                    $out[] = [
                        'type' => 'quote',
                        'data' => [
                            'text'   => $data['text']   ?? '',
                            'author' => $data['author'] ?? '',
                        ],
                    ];
                    break;

                case 'callout':
                    $out[] = [
                        'type' => 'callout',
                        'data' => [
                            'variant' => $data['variant'] ?? 'info',
                            'html'    => $data['html']    ?? '',
                        ],
                    ];
                    break;

                case 'problem_solution':
                    $out[] = [
                        'type' => 'problem_solution',
                        'data' => [
                            'number'  => isset($data['number']) ? (int) $data['number'] : null,
                            'title'   => $data['title']   ?? '',
                            'problem' => $data['problem'] ?? '',
                            'solution' => $data['solution'] ?? '',
                        ],
                    ];
                    break;
                case 'list': {
                        $style = ($data['style'] ?? 'ul') === 'ol' ? 'ol' : 'ul';
                        $rawItems = $data['items'] ?? [];
                        $items = [];
                        if (is_array($rawItems)) {
                            foreach ($rawItems as $it) {
                                $s = trim((string) $it);
                                if ($s !== '') $items[] = $s;
                            }
                        }
                        $out[] = [
                            'type' => 'list',
                            'data' => [
                                'style' => $style,
                                'items' => array_values($items),
                            ],
                        ];
                        break;
                    }
            }
        }

        return $out;
    }

    public function destroy(Blog $blog)
    {

        if ($blog->cover_image_path) {
            $path = ltrim($blog->cover_image_path, '/');
            $path = preg_replace('#^(public/|storage/)#', '', $path);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $blog->delete();

        return redirect()->route('admin.blogs.index')->with('success', 'Blog deleted successfully.');
    }

    public function comments(Blog $blog, Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $comments = $blog->comments()
            // ->with('user')
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('body', 'like', "%{$q}%")
                        // ->orWhere('content', 'like', "%{$q}%")
                        // ->orWhere('text', 'like', "%{$q}%")
                        ->orWhere('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return view('admin.blog.comments', compact('blog', 'comments'));
    }

    public function destroyComment(Blog $blog, Comment $comment)
    {
        $comment->delete();

        return back()->with('success', 'Comment deleted successfully.');
    }
}
