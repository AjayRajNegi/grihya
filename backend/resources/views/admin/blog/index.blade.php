@extends('layouts.admin')

@section('title', 'All Blogs')

@section('content')
<div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div>
        <h1 class="text-2xl font-bold">Blogs</h1>
        <p class="text-gray-600">All blog posts with quick actions.</p>
    </div>
    <a href="{{ route('admin.submit-blog') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
        Create Blog
    </a>
</div>

<div class="bg-white rounded-xl shadow p-5 mb-4">
    <form method="get" action="{{ route('admin.blogs.index') }}" class="grid md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
            <label class="text-sm text-gray-600">Search (title, slug, excerpt)</label>
            <input type="text" name="q" value="{{ request('q') }}" placeholder="e.g. rental tips"
                class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        </div>
        <div>
            <label class="text-sm text-gray-600">Status</label>
            <select name="status" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
                <option value="">Any</option>
                <option value="draft" @selected(request('status')==='draft' )>Draft</option>
                <option value="published" @selected(request('status')==='published' )>Published</option>
            </select>
        </div>
        <div class="md:col-span-4 flex justify-end gap-2">
            <a href="{{ route('admin.blogs.index') }}" class="px-4 py-2 rounded border">Reset</a>
            <button class="px-4 py-2 rounded bg-indigo-600 text-white">Filter</button>
        </div>
    </form>
</div>


@if(session('success'))
<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
    {{ session('success') }}
</div>
@endif
<div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
    @forelse($blogs as $blog)
    <div class="bg-white rounded-xl shadow overflow-hidden flex flex-col h-full">
        <img src="{{ $blog->cover_url }}" alt="cover"
            class="w-full h-40 object-cover">
        <div class="p-4 flex-1 flex flex-col">
            <div class="flex items-start justify-between gap-2">
                <h3 class="font-semibold line-clamp-2">{{ $blog->title }}</h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs
                  {{ $blog->status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700' }}">
                    {{ ucfirst($blog->status) }}
                </span>
            </div>
            <p class="mt-2 text-sm text-gray-600 line-clamp-3">{{ $blog->excerpt }}</p>
            <div class="mt-3 text-xs text-gray-500">
                @if($blog->published_at)
                Published: {{ $blog->published_at->format('d M Y, H:i') }}
                @else
                Created: {{ $blog->created_at?->format('d M Y') }}
                @endif
            </div>
            <div class="mt-auto flex gap-2 pt-3">
                <a href="{{ route('admin.blogs.edit', $blog) }}"
                    class="inline-flex items-center px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                    Edit
                </a>

                <a href="{{ route('admin.blogs.comments', $blog) }}" class="inline-flex items-center px-3 py-1.5 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200">
                    Check Comments
                </a>

                <form action="{{ route('admin.blogs.destroy', $blog) }}" method="POST"
                    onsubmit="return confirm('Delete this blog? This cannot be undone.');">
                    @csrf
                    @method('DELETE')
                    <button type="submit"
                        class="inline-flex items-center px-3 py-1.5 rounded bg-rose-100 text-rose-700 text-sm hover:bg-rose-200">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    </div>
    @empty
    <div class="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-gray-500">No blogs found.</div>
    @endforelse
</div>

<div class="mt-6">
    {{ $blogs->onEachSide(1)->links() }}
</div>
@endsection