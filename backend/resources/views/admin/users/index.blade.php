@extends('layouts.admin', ['title' => 'All Users'])

@section('content')
<div class="mb-6 flex items-center justify-between">
  <div>
    <h1 class="text-2xl font-bold">All Users</h1>
    <p class="text-gray-600">Manage and search registered users.</p>
  </div>
  <div class="flex gap-3">
    <div class="bg-white rounded-lg shadow px-4 py-2 text-sm">Total: <span class="font-semibold">{{ number_format($totalUsers) }}</span></div>
    @foreach(['tenant' => 'Tenants','owner' => 'Owners','broker' => 'Brokers','builder' => 'Builders'] as $k => $label)
    <div class="bg-white rounded-lg shadow px-4 py-2 text-sm">{{ $label }}: <span class="font-semibold">{{ $usersByRole[$k] ?? 0 }}</span></div>
    @endforeach
  </div>
</div>

@if(session('success'))
<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
  {{ session('success') }}
</div>
@endif

<div class="bg-white rounded-xl shadow p-5 mb-6">
  <form method="get" action="{{ route('all-users') }}" class="grid md:grid-cols-5 gap-4">
    <div class="md:col-span-2">
      <label class="text-sm text-gray-600">Search (name, email, phone)</label>
      <input type="text" name="q" value="{{ request('q') }}" placeholder="e.g. John, 98765..."
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Role</label>
      <select name="role" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        @foreach(['tenant','owner','broker','builder'] as $r)
        <option value="{{ $r }}" @selected(request('role')===$r)>{{ ucfirst($r) }}</option>
        @endforeach
      </select>
    </div>
    <div>
      <label class="text-sm text-gray-600">City</label>
      <input type="text" name="city" value="{{ request('city') }}"
        class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
    </div>
    <div>
      <label class="text-sm text-gray-600">Verified</label>
      <select name="verified" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
        <option value="">Any</option>
        <option value="email" @selected(request('verified')==='email' )>Email Verified</option>
        <option value="phone" @selected(request('verified')==='phone' )>Phone Verified</option>
        <option value="both" @selected(request('verified')==='both' )>Both</option>
        <option value="none" @selected(request('verified')==='none' )>None</option>
      </select>
    </div>
    <div class="md:col-span-5 flex justify-end gap-2">
      <a href="{{ route('all-users') }}" class="px-4 py-2 rounded border">Reset</a>
      <button class="px-4 py-2 rounded bg-indigo-600 text-white">Filter</button>
    </div>
  </form>
</div>

<div class="bg-white rounded-xl shadow overflow-x-auto">
  <table class="min-w-full text-sm">
    <thead class="bg-gray-50 text-gray-600">
      <tr>
        <th class="px-4 py-3 text-left font-semibold w-16">S.No</th>
        <th class="px-4 py-3 text-left font-semibold">User</th>
        <th class="px-4 py-3 text-left font-semibold">Contact</th>
        <th class="px-4 py-3 text-left font-semibold">City</th>
        <th class="px-4 py-3 text-left font-semibold">Role</th>
        <th class="px-4 py-3 text-left font-semibold">Properties</th>
        <th class="px-4 py-3 text-left font-semibold">Joined</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      @forelse($users as $user)
      <a href="{{ route('user.detail', $user->id) }}" class="font-medium text-indigo-600 hover:underline"
        onclick="event.stopPropagation();"></a>
      <tr class="hover:bg-gray-50 cursor-pointer"
        onclick=window.location="{{ route('user.detail', $user->id) }}">
        <td class="px-4 py-3 text-gray-700">
          @php
          $sn = $users instanceof \Illuminate\Pagination\LengthAwarePaginator
          ? ($users->firstItem() + $loop->index)
          : ($loop->index + 1);
          @endphp
          {{ $sn }}
        </td>
        <td class="px-4 py-3">
          <!-- <div class="text-xs text-gray-500">ID: {{ $user->id }}</div> -->
          <a href="{{ route('user.detail', $user->id) }}" class="font-medium text-indigo-600 hover:underline"
            onclick="event.stopPropagation();">
            {{ $user->name }}
          </a>
        </td>
        <td class="px-4 py-3">
          <div>📧 {{ $user->email }}</div>
          <div>📞 {{ $user->phone }}</div>
        </td>
        <td class="px-4 py-3">{{ $user->city ?? '-' }}</td>
        <td class="px-4 py-3">
          <span class="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {{ ucfirst($user->role) }}
          </span>
        </td>
        <td class="px-4 py-3">
          <a class="text-indigo-600 hover:underline"
            href="{{ route('all-properties', ['user_id' => $user->id]) }}"
            onclick="event.stopPropagation();">
            {{ $user->properties_count }}
          </a>
        </td>
        <td class="px-4 py-3 text-gray-600">{{ $user->created_at->format('d M Y') }}</td>
      </tr>
      </a>
      @empty
      <tr>
        <td colspan="7" class="px-4 py-6 text-center text-gray-500">No users found.</td>
      </tr>
      @endforelse
    </tbody>
  </table>
</div>

<div class="mt-4">
  {{ $users->onEachSide(1)->links() }}
</div>
@endsection