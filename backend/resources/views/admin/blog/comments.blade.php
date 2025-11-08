@extends('layouts.admin')

@section('title', 'Comments')

@section('content')

<div class="mb-6 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold">Comments for: {{ $blog->title }}</h1>
        <p class="text-gray-600">Manage comments on this blog.</p>
    </div> <a href="{{ route('admin.blogs.index') }}" class="px-4 py-2 rounded border hover:bg-gray-50">Back to Blogs</a>
</div>
@if(session('success'))

<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm"> {{ session('success') }} </div> @endif<div class="bg-white rounded-xl shadow p-5 mb-4">
    <form method="get" action="{{ route('admin.blogs.comments', $blog) }}" class="grid md:grid-cols-4 gap-4">
        <div class="md:col-span-3"> <label class="text-sm text-gray-600">Search (text, name, email)</label> <input type="text" name="q" value="{{ request('q') }}" placeholder="e.g. great post" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"> </div>
        <div class="md:col-span-1 flex items-end">
            <div class="ml-auto flex gap-2"> <a href="{{ route('admin.blogs.comments', $blog) }}" class="px-4 py-2 rounded border">Reset</a> <button class="px-4 py-2 rounded bg-indigo-600 text-white">Filter</button> </div>
        </div>
    </form>
</div>
<div class="bg-white rounded-xl shadow overflow-x-auto">
    <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
            <tr>
                <th class="px-4 py-3 text-left font-semibold">ID</th>
                <th class="px-4 py-3 text-left font-semibold">Author</th>
                <th class="px-4 py-3 text-left font-semibold">Comment</th>
                <th class="px-4 py-3 text-left font-semibold">Posted</th>
                <th class="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y"> @forelse($comments as $comment) <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500">#{{ $comment->id }}</td>
                <td class="px-4 py-3">
                    <div class="font-medium"> {{ optional($comment->user)->name ?? ($comment->name ?? 'Anonymous') }} </div>
                    <div class="text-xs text-gray-500"> {{ optional($comment->user)->email ?? ($comment->email ?? '-') }} </div>
                </td>
                <td class="px-4 py-3"> {{ $comment->body ?? $comment->content ?? $comment->text ?? '-' }} </td>
                <td class="px-4 py-3 text-gray-600"> {{ $comment->created_at?->format('d M Y, H:i') }} </td>
                <td class="px-4 py-3">
                    <form action="{{ route('admin.blogs.comments.destroy', [$blog, $comment]) }}" method="POST" onsubmit="return confirm('Delete this comment?');"> @csrf @method('DELETE') <button type="submit" class="inline-flex items-center px-3 py-1.5 rounded bg-rose-100 text-rose-700 text-sm hover:bg-rose-200"> Delete </button> </form>
                </td>
            </tr> @empty <tr>
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">No comments found.</td>
            </tr> @endforelse </tbody>
    </table>
</div>
<div class="mt-6"> {{ $comments->onEachSide(1)->links() }} </div> @endsection