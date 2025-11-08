@extends('layouts.admin')

@section('title', 'Banned Account Details')

@section('content')
<div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-semibold">Banned Account Details</h1>
    <div class="flex items-center gap-2">
        <form method="POST"
            action="{{ route('admin.banned.destroy', $account->id) }}"
            onsubmit="return confirm('Unban this account? This will remove the ban record.');">
            @csrf
            @method('DELETE')
            <button type="submit"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                Unban this Account
            </button>
        </form>
        <a href="{{ route('admin.banned.index') }}"
            class="px-4 py-2 rounded border hover:bg-gray-50">Back</a>
    </div>
</div>

<div class="bg-white rounded-lg shadow p-6">
    @php
    $attributes = $account->getAttributes();
    @endphp

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @foreach($attributes as $key => $value)
        <div class="border rounded-md p-4">
            <div class="text-xs uppercase text-gray-500 font-semibold mb-1">{{ str_replace('_',' ', $key) }}</div>
            <div class="text-gray-800">
                @if(is_array($value))
                <pre class="text-xs bg-gray-50 p-2 rounded">{{ json_encode($value, JSON_PRETTY_PRINT) }}</pre>
                @else
                {{ is_string($value) && strlen($value) > 500 ? Str::limit($value, 500) : ( $value ?? '—' ) }}
                @endif
            </div>
        </div>
        @endforeach
    </div>
</div>
@endsection