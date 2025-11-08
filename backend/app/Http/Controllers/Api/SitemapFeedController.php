<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;
// Adjust to your models 
use App\Models\Blog;
use App\Models\Property;

class SitemapFeedController extends Controller
{

    public function blogs(): JsonResponse
    {
        $items = Cache::remember('sitemap:blogs', 900, function () {
            return Blog::query()->where('status', 'published')
                ->select('slug', 'updated_at')->orderBy('id')->get()->map(function ($b) {
                    return ['slug' => $b->slug, 'updated_at' => optional($b->updated_at)->toAtomString(),];
                });
        });
        return response()->json($items);
    }
    public function properties(): JsonResponse
    {
        $items = Cache::remember('sitemap:properties', 900, function () {
            return Property::query()->where('status', 'published') // or 'active'
                ->select('slug', 'updated_at')->orderBy('id')->get()->map(function ($p) {
                    return ['slug' => $p->slug, 'updated_at' => optional($p->updated_at)->toAtomString(),];
                });
        });
        return response()->json($items);
    }
}
