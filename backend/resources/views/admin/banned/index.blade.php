@extends('layouts.admin')

@section('title', 'Banned Accounts')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold">Banned Accounts</h1>

    <form method="GET" class="relative">
        <input type="text" name="search" value="{{ request('search') }}"
            placeholder="Search by email, name, or user ID"
            class="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        @if(request('search'))
        <a href="{{ route('admin.banned.index') }}" class="ml-2 text-sm text-indigo-600 hover:underline">Clear</a>
        @endif
    </form>
</div>

@if(session('success'))
<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
    {{ session('success') }}
</div>
@endif

<div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banned At</th>
                <th class="px-4 py-3"></th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            @forelse($banned as $account)
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-700">{{ $account->id }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    {{ $account->name ?? $account->full_name ?? $account->user_id ?? '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    {{ $account->email ?? '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    {{ Str::limit($account->reason ?? $account->ban_reason ?? '-', 60) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    {{ $account->banned_at ?? $account->created_at ?? '-' }}
                </td>
                <td class="px-4 py-3 text-right">
                    <a href="{{ route('admin.banned.show', $account->id) }}"
                        class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        View
                    </a>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="px-4 py-10 text-center text-gray-500">
                    No banned accounts found.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($banned->hasPages())
<div class="mt-4">
    {{ $banned->links() }}
</div>
@endif
@endsection