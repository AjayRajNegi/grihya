<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Validation\Rule;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->integer('limit', 6);
        $q = trim((string) $request->query('q', ''));

        $query = Blog::published()->latest('published_at');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%");
            });
        }

        $posts = $query->paginate($limit);
        return PostResource::collection($posts);
    }


    public function show(Blog $post)
    {
        abort_unless($post->status === 'published', 404);
        return new PostResource($post->load('author'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'                  => ['required', 'string', 'max:255'],
            'slug'                   => ['required', 'string', 'max:255', Rule::unique('blogs', 'slug')],
            'excerpt'                => ['nullable', 'string', 'max:500'],

            'content'                => ['required', 'array'],
            'content.*.type'         => ['required', Rule::in(['hero', 'heading', 'paragraph', 'image', 'quote', 'callout', 'problem_solution', 'list'])],
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

            'status'                 => ['required', Rule::in(['draft', 'published'])],
            'published_at'           => ['nullable', 'date'],
            'meta_title'             => ['nullable', 'string', 'max:255'],
            'meta_description'       => ['nullable', 'string', 'max:160'],
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image_path'] = $request->file('cover_image')->store('blog', 'public');
        }

        $data['content'] = $this->processBlocks($request);

        $data['likes_count']    = 0;
        $data['shares_count']   = 0;
        $data['comments_count'] = 0;

        $blog = Blog::create($data);

        if ($request->expectsJson()) {
            return new PostResource($blog);
        }

        return redirect()
            ->route('admin.submit-blog')
            ->with('success', 'Blog created successfully!');
    }

    // public function update(Request $request, Blog $blog)
    // {
    //     $data = $request->validate([
    //         'title'                  => ['sometimes', 'string', 'max:255'],
    //         'slug'                   => ['sometimes', 'string', 'max:255', Rule::unique('blogs', 'slug')->ignore($blog->id)],
    //         'excerpt'                => ['nullable', 'string', 'max:500'],

    //         'content'                => ['sometimes', 'array'],
    //         'content.*.type'         => ['required_with:content', Rule::in(['hero', 'heading', 'paragraph', 'image', 'quote', 'callout', 'problem_solution', 'list'])],
    //         'content.*.data'         => ['nullable', 'array'],
    //         'content.*.data.file'    => ['nullable', 'file', 'image', 'max:5120'],
    //         'content.*.data.src_url' => ['nullable', 'string'],
    //         'content.*.data.alt'     => ['nullable', 'string', 'max:255'],
    //         'content.*.data.caption' => ['nullable', 'string', 'max:255'],
    //         'content..data.style' => ['nullable', Rule::in(['ul', 'ol'])],
    //         'content..data.items' => ['nullable', 'array'],
    //         'content..data.items.' => ['nullable', 'string', 'max:500'],

    //         'cover_image_path'       => ['nullable', 'string', 'max:255'],
    //         'cover_image'            => ['nullable', 'image', 'max:5120'],

    //         'status'                 => ['sometimes', Rule::in(['draft', 'published'])],
    //         'published_at'           => ['nullable', 'date'],
    //         'meta_title'             => ['nullable', 'string', 'max:255'],
    //         'meta_description'       => ['nullable', 'string', 'max:160'],
    //     ]);

    //     if ($request->hasFile('cover_image')) {
    //         $data['cover_image_path'] = $request->file('cover_image')->store('blog', 'public');
    //     }

    //     if ($request->has('content')) {
    //         $data['content'] = $this->processBlocks($request);
    //     }

    //     $blog->update($data);

    //     return new PostResource($blog);
    // }
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

    public function destroy(Blog $post)
    {
        $post->delete();
        return response()->noContent();
    }

    public function like(Blog $post)
    {
        $post->increment('likes_count');
        return response()->json(['likes_count' => $post->likes_count]);
    }

    public function unlike(Blog $post)
    {
        if ($post->likes_count > 0) {
            $post->decrement('likes_count');
        }
        return response()->json(['likes_count' => $post->likes_count]);
    }

    public function share(Blog $post)
    {
        $post->increment('shares_count');
        return response()->json(['shares_count' => $post->shares_count]);
    }

    public function see()
    {
        return view('admin.blog.submit');
    }
}
